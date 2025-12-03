import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../config/env.js";
import prisma from "./prisma.js";
import { sendOrderEmail } from "./email.js";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";
import { orderSelect } from "../config/prismaHelpers.js";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  typescript: true,
});

//handle more cases
export async function stripeEventHandler(stripeEvent: Stripe.Event) {
  switch (stripeEvent.type) {
    //only for card payment not for async payments like klarna etc.
    case "checkout.session.completed":
      //successful action
      const session = stripeEvent.data.object;
      const shippingAddress = session.customer_details?.address
        ? `${session.customer_details.address.line1 ?? ""}, ${session.customer_details.address.line2 ?? ""}, ${session.customer_details.address.city ?? ""}, ${session.customer_details.address.state ?? ""}, ${session.customer_details.address.postal_code ?? ""}, ${session.customer_details.address.country ?? ""}`
            .replace(/(, )+/g, ", ")
            .trim()
        : null;
      const orderId = session.metadata?.orderId!;
      const userId = session.metadata?.userId!;
      const email = session.customer_details?.email!;

      console.log(chalk.yellow(`${getTimestamp()} Processing checkout.session.completed, orderId: ${orderId}, userId: ${userId}`));
      //since stripe isnt idempotent and can fire multiple times gotta first check if it already fired
      const existingOrder = await prisma.order.findUnique({ where: { id: orderId } })
      if(existingOrder?.status === "ORDERED") return

      //update order status and empty user cart
      const [_, order, payment] = await prisma.$transaction([
        prisma.cartItem.deleteMany({
          where: { cart: { userId: userId } },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: {
            status: "ORDERED",
            shipping_address: shippingAddress,
          },
          select: orderSelect,
        }),
        prisma.payment.update({
          where: { order_id: orderId },
          data: {
            status: "COMPLETED",
          },
        }),
      ]);

      console.log(chalk.green(`${getTimestamp()} Cart cleared and order updated: orderId ${orderId}`));

      await sendOrderEmail(email, order);

    default:
      console.log(chalk.gray(`${getTimestamp()} Unhandled Stripe event: ${stripeEvent.type}`));
  }
}

export default stripe;
