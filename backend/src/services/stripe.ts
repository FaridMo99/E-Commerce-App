import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../config/env.js";
import prisma from "./prisma.js";
import { notifyAdmin, notifyUser, sendOrderEmail } from "./email.js";
import chalk from "chalk";
import { getTimestamp, refundOrder, releaseCartItems } from "../lib/utils.js";
import { orderSelect } from "../config/prismaHelpers.js";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  typescript: true,
});


export async function stripeEventHandler(stripeEvent: Stripe.Event):Promise<void> {

  const eventHappened = await prisma.stripeEvent.findUnique({
    where: {
      id:stripeEvent.id
    }
  })

  if (eventHappened) {
    console.log(chalk.green(getTimestamp(), "Already Processed Webhook"))
    return
  }


  switch (stripeEvent.type) {
    //only for card payment not for async payments like klarna etc.
    case "checkout.session.completed": {

      const session = stripeEvent.data.object;
      const shippingAddress = session.customer_details?.address
        ? `${session.customer_details.address.line1 ?? ""}, ${session.customer_details.address.line2 ?? ""}, ${session.customer_details.address.city ?? ""}, ${session.customer_details.address.state ?? ""}, ${session.customer_details.address.postal_code ?? ""}, ${session.customer_details.address.country ?? ""}`
          .replace(/(, )+/g, ", ")
          .trim()
        : null;
      const orderId = session.metadata?.orderId!;
      const userId = session.metadata?.userId!;
      const email = session.customer_details?.email!;
      const paymentIntentId = session.payment_intent;

      console.log(
        chalk.yellow(
          `${getTimestamp()} Processing checkout.session.completed, orderId: ${orderId}, userId: ${userId}`
        )
      );

      //checking if order already expired
      const expiredOrder = await prisma.order.findUnique({
        where: {
          id: orderId,
          user_id: userId,
          status: "EXPIRED",
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });

      if (expiredOrder) {
        console.log(
          chalk.yellow(
            `${getTimestamp()} Order expired, checking if stock amount enough to proceed with order...`
          )
        );

        let stockIsEnoughToProceed: boolean = true;

        //compare each items stock amount with order amount to proceed or not
        expiredOrder.items.forEach((item) => {
          if (item.quantity > item.product.stock_quantity) {
            stockIsEnoughToProceed = false;
          }
        });

        if (stockIsEnoughToProceed) {
          console.log(chalk.green(`${getTimestamp()} Stock enough to proceed`));

          await prisma.$transaction(
            expiredOrder.items.map((item) =>
              prisma.product.update({
                where: { id: item.product.id },
                data: {
                  stock_quantity: {
                    decrement: item.quantity,
                  },
                },
              })
            )
          );
        }

        if (!stockIsEnoughToProceed) {
          console.log(
            chalk.yellow(
              `${getTimestamp()} Stock Amount not enough to proceed, notifying user and admin...`
            )
          );

          const [refund] = await Promise.all([
            refundOrder(
              paymentIntentId,
              expiredOrder.total_amount,
              expiredOrder.currency
            ),
            notifyAdmin(
              `Failed to Proceed with Customer ${expiredOrder.user.name} Order with the Order ID: ${expiredOrder.id}. Amount will be automatically refunded.`
            ),
            notifyUser(
              expiredOrder.user.id,
              "Failed Order",
              `Failed to Proceed with your Order:${expiredOrder.id} due to insufficient stock amount. Your Money will be refunded in your original Payment method.`
            )
          ]);

          await prisma.order.update({
              where: {
                id: expiredOrder.id,
              },
              data: {
                status: "REFUND_PENDING",
                payment: {
                  update: {
                    status: "REFUNDING",
                    stripeRefundId: typeof refund?.payment_intent === "string"
                  ? refund.payment_intent
                  : refund.payment_intent_id!
                  },
                },
              },
            })

          break
        }
      }

      //update order status and empty user cart
      const [_, order] = await prisma.$transaction([
        prisma.cartItem.deleteMany({
          where: { cart: { userId: userId } },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: {
            status: "ORDERED",
            shipping_address: shippingAddress,
            payment: {
              update: {
                status:"COMPLETED"
              }
            }
          },
          select: orderSelect,
        })
      ]);

      console.log(
        chalk.green(
          `${getTimestamp()} Cart cleared and order updated: orderId ${orderId}`
        )
      );

      await sendOrderEmail(email, order);
      break
    }
      
    case "checkout.session.expired": {
      console.log(
        chalk.yellow(`${getTimestamp()} Processing checkout.session.expired...`)
      );

      const session = stripeEvent.data.object;
      const orderId = session.metadata?.orderId!;

      await Promise.all([
        releaseCartItems(orderId),
        prisma.order.update({
          where: {
            id:orderId
          },
          data: {
            status: "EXPIRED",
            payment: {
              update: {
                status:"CANCELLED"
              }
            }
          }
        })])

      console.log(
        chalk.green(
          `${getTimestamp()} Processed checkout.session.expired successfully`
        )
      );
      break;
    }
      
    case "charge.refunded": {

      const session = stripeEvent.data.object;
      const orderId = session.metadata?.orderId!;

      console.log(
        chalk.yellow(
          `${getTimestamp()} Processing charge.refunded...`
        )
      );

      await prisma.order.update({
        where: {
          id:orderId
        },
        data: {
          status: "REFUNDED",
          payment: {
            update: {
              status:"REFUNDED"
            }
          }
        }
      })


      console.log(
        chalk.green(`${getTimestamp()} Processed charge.refunded successfully`)
      );
      
      break
    }
      
      
    default: {
      console.log(
        chalk.gray(
          `${getTimestamp()} Unhandled Stripe event: ${stripeEvent.type}`
        )
      );
      //only for mvp, for real app handle all the cases properly
      await notifyAdmin(`Unknown Stripe event occured, please check your Stripe Dashboard for more information under the Event ID: ${stripeEvent.id}`)
    }
  }

  //creates event in db to avoid multiple times doing the same action since stripe isnt idempotent (webhooks can fire multiple times)
    await prisma.stripeEvent.create({
      data: {
        id: stripeEvent.id,
        type: stripeEvent.type
      },
        })
}

export default stripe;
