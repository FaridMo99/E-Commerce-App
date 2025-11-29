import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import {
  formatPriceForClient,
} from "../lib/currencyHandlers.js";
import stripe from "../services/stripe.js";
import { CLIENT_ORIGIN } from "../config/env.js";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";
import { orderSelect } from "../config/prismaHelpers.js";

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

// Make a new order
export async function makeOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!;

  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Creating order for user ${userId}`)
    );

    const shoppingCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!shoppingCart) {
      console.log(
        chalk.red(
          `${getTimestamp()} Shopping cart not found for user ${userId}`
        )
      );
      return res.status(404).json({ message: "Shopping Cart not found" });
    }

    if (shoppingCart.items.length === 0) {
      console.log(
        chalk.red(`${getTimestamp()} Shopping cart empty for user ${userId}`)
      );
      return res.status(400).json({ message: "No Items in Cart" });
    }

    const line_items = await Promise.all(
      shoppingCart.items.map(async (item) => {
        const exchange = await exchangeToCurrencyInCents(
          item.product.currency,
          item.product.price,
          currency
        );
        const priceInCents = exchange.exchangedPriceInCents;

        return {
          price_data: {
            currency: exchange.currency.toLowerCase(),
            product_data: {
              name: item.product.name,
              description: item.product.description,
            },
            unit_amount: priceInCents,
          },
          quantity: item.quantity,
        };
      })
    );

    const totalAmount = line_items.reduce((sum, item) => {
      const price = item.price_data.unit_amount!;
      const quantity = item.quantity!;
      return sum + price * quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        user_id: userId,
        status: "PENDING",
        currency,
        total_amount: totalAmount,
        items: {
          create: shoppingCart.items.map((item) => ({
            product: { connect: { id: item.product.id } },
            quantity: item.quantity,
            price_at_purchase: item.product.sale_price ?? item.product.price,
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${CLIENT_ORIGIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_ORIGIN}/cart?cancelOrderId=${order.id}`,
      billing_address_collection: "required",
      metadata: { orderId: order.id, userId },
    });

    await prisma.$transaction(
      shoppingCart.items.map((item) =>
        prisma.product.update({
          where: { id: item.product.id },
          data: { stock_quantity: { decrement: item.quantity } },
        })
      )
    );

    console.log(
      chalk.green(
        `${getTimestamp()} Order created successfully for user ${userId}`
      )
    );
    return res.status(200).json({ sessionId: session.id });
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
    const orderItems = await prisma.order_Item.findMany({
      where: { order_id: orderId },
    });

    await prisma.$transaction(
      orderItems.map((item) =>
        prisma.product.update({
          where: { id: item.product_id },
          data: { stock_quantity: { increment: item.quantity } },
        })
      )
    );

    if (orderItems.length === 0) {
      console.log(
        chalk.red(
          `${getTimestamp()} Order ${orderId} not found for user ${userId}`
        )
      );
      return res.status(404).json({ message: "Order not found" });
    }

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