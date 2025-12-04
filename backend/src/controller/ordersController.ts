import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import {
  formatPriceForClient,
  transformAndFormatProductPriceInCents,
} from "../lib/currencyHandlers.js";
import stripe from "../services/stripe.js";
import { CLIENT_ORIGIN } from "../config/env.js";
import chalk from "chalk";
import { calculateCartTotalsInCents, getTimestamp, releaseCartItems } from "../lib/utils.js";
import { cartSelect, orderSelect, type CartWithSelectedFields } from "../config/prismaHelpers.js";
import type Stripe from "stripe";

// Get orders within a timeframe
export async function getOrders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { from, to } = req.timeframe!;
  const { limit, sortBy, page, sortOrder } = req.query;

  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Fetching orders from ${from} to ${to}`)
    );

    const take = limit ? Number(limit) : 10;
    const currentPage = page ? Number(page) : 1;

    if (isNaN(take) || take <= 0) {
      console.log(chalk.red(`${getTimestamp()} Invalid limit: ${limit}`));
      return res.status(400).json({ error: "Invalid limit" });
    }
    if (isNaN(currentPage) || currentPage <= 0) {
      console.log(chalk.red(`${getTimestamp()} Invalid page: ${page}`));
      return res.status(400).json({ error: "Invalid page" });
    }

    const skip = (currentPage - 1) * take;

    const allowedFields = ["ordered_at", "total_amount", "status"];
    const field = allowedFields.includes(sortBy as string)
      ? (sortBy as string)
      : "ordered_at";
    const order: "asc" | "desc" = sortOrder === "desc" ? "desc" : "asc";

    const orders = await prisma.order.findMany({
      where: {
        ordered_at: {
          ...(from && { gte: from }),
          ...(to && { lte: to }),
        },
      },
      skip,
      take,
      orderBy: { [field]: order },
      select: {
        ...orderSelect
      }
    });

    orders.forEach(
      (order) => (order.total_amount = formatPriceForClient(order.total_amount))
    );

    console.log(chalk.green(`${getTimestamp()} Orders fetched successfully`));
    return res.status(200).json(orders);
  } catch (err) {
    console.log(chalk.red(`${getTimestamp()} Failed to fetch orders:`, err));
    next(err);
  }
}

export async function makeOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!;
  const currency = req.currency!

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Starting order process for user ${userId}`
      )
    );

    //fetch cart
    const shoppingCart:CartWithSelectedFields | null = await prisma.cart.findUnique({
      where: { userId },
      select: cartSelect,
    });

    if (!shoppingCart) {
      console.log(
        chalk.red(`${getTimestamp()} Cart not found for user ${userId}`)
      );
      return res.status(404).json({ message: "Shopping Cart not found" });
    }

    if (shoppingCart.items.length === 0) {
      console.log(
        chalk.red(`${getTimestamp()} Shopping cart empty for user ${userId}`)
      );
      return res.status(400).json({ message: "No Items in Cart" });
    }

    //initial check of stock and cart
    let cartUpdated = false;
    const updatedItems = shoppingCart.items.map((item) => {
      const product = item.product;

      if (product.stock_quantity < item.quantity) {
        cartUpdated = true;
        console.log(
          chalk.yellow(
            `${getTimestamp()} Adjusting cart item for product ${product.id}. Requested: ${item.quantity}, Available: ${product.stock_quantity}`
          )
        );
        return {
          ...item,
          quantity: product.stock_quantity,
        };
      }
      return item;
    });


    if (cartUpdated) {
    
    await Promise.all(
      updatedItems.map((item) =>
        prisma.cartItem.update({
          where: { cartId_productId: { cartId: shoppingCart.id, productId: item.product.id } },
          data: { quantity: item.quantity },
        })
      )
    );

    return res.status(400).json({ message: "Some items in your cart were updated due to insufficient stock. Please review and try again." });
    
  }


    //transform prices to customers currency in cents, add totals for each product and whole cart in cents
    await Promise.all(shoppingCart.items.map((item) => transformAndFormatProductPriceInCents(item.product,item.product.currency,currency)));

    const cartWithTotals = calculateCartTotalsInCents(shoppingCart);

    let order;
    let finalItems = cartWithTotals.items;

    //atomic order creation, stock decrement, and check
    try {
      order = await prisma.$transaction(async (tx) => {
        //decrement stock for all items
        await Promise.all(
          finalItems.map(async (item) => {
            //atomically decrement the stock quantity
            const updatedProduct = await tx.product.update({
              where: { id: item.product.id },
              data: {
                stock_quantity: {
                  decrement: item.quantity,
                },
              },
              select: { stock_quantity: true, name: true, id: true },
            });

            if (updatedProduct.stock_quantity < 0) {
              throw new Error(
                `Insufficient stock for product ${updatedProduct.name} (ID: ${updatedProduct.id})`
              );
            }
          })
        );

        //create order
        return tx.order.create({
          data: {
            user_id: userId,
            status: "PENDING",
            currency,
            total_amount: cartWithTotals.total!,
            items: {
              create: finalItems.map((item) => ({
                product: { connect: { id: item.product.id } },
                quantity: item.quantity,
                price_at_purchase:
                  item.product.sale_price ?? item.product.price,
                currency,
              })),
            },
            payment: {
              create: {
                method: "CARD",
                details: "Stripe Checkout Session",
                status: "PENDING",
              },
            },
          },
        });
      });
    } catch (transactionError) {

      if (
        transactionError instanceof Error &&
        transactionError.message.includes("Insufficient stock")
      ) {
        console.log(
          chalk.red(
            `${getTimestamp()} Transaction failed due to: ${transactionError.message}`
          )
        );
        return res.status(400).json({
          message: transactionError.message + ". Please try again.",
        });
      }
      throw transactionError;
    }

    //create stripe line Items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      finalItems.map((item) => {
        const productPrice = item.product.sale_price ?? item.product.price;
        return {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: item.product.name,
              images:item.product.imageUrls
            },
            //stripe price in cents
            unit_amount: productPrice,
          },
          quantity: item.quantity,
        };
      });

    //create stripe checkout session
      //pass locale
    try {
      console.log(lineItems)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${CLIENT_ORIGIN}/user/orders/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${CLIENT_ORIGIN}/user/orders/cancel?cancelOrderId=${order.id}`,
        billing_address_collection: "required",
        metadata: { orderId: order.id, userId },
      });

      //save session id
      await prisma.order.update({
        where: { id: order.id },
        data: { stripe_session_id: session.id },
      });

      console.log(
        chalk.green(
          `${getTimestamp()} Order ${order.id} created and Stripe session initiated for user ${userId}`
        )
      );
      //session id for redirect
      return res.status(200).json({ redirectUrl: session.url });

    } catch (err) {
      console.log(chalk.red(getTimestamp(),"stripe error", err.message))
      await releaseCartItems(order.id)
      next(err)
    }

  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to create order for user ${userId}:`,
        err
      )
    );
    next(err);
  }
}

// Cancel order
export async function cancelOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!;
  const orderId = req.params.orderId;

  if (!orderId) {
    console.log(
      chalk.red(`${getTimestamp()} No orderId provided by user ${userId}`)
    );
    return res.status(400).json({ message: "No order id provided" });
  }

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Cancelling order ${orderId} for user ${userId}`
      )
    );

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      console.log(
        chalk.red(
          `${getTimestamp()} Order ${orderId} not found for user ${userId}`
        )
      );
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "PENDING") return res.status(400).json({message:`Cant cancel this order since its already ${order.status}`})
    
    
    await releaseCartItems(orderId)


    console.log(
      chalk.green(
        `${getTimestamp()} Order ${orderId} cancelled successfully for user ${userId}`
      )
    );

    return res.status(200).json({ message: "Order cancelled" });
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to cancel order ${orderId} for user ${userId}:`,
        err
      )
    );
    next(err);
  }
}