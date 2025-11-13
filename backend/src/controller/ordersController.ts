import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import {
  exchangeToCurrencyInCents,
  formatPriceForClient,
} from "../lib/currencyHandlers.js";
import type { CurrencyISO } from "../generated/prisma/enums.js";
import stripe from "../services/stripe.js";
import { CLIENT_ORIGIN } from "../config/env.js";

export async function getOrders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { from, to } = req.timeframe!;
  const { limit, sortBy, page, sortOrder } = req.query;

  try {
    const take = limit ? Number(limit) : 10;
    const currentPage = page ? Number(page) : 1;

    if (isNaN(take) || take <= 0)
      return res.status(400).json({ error: "Invalid limit" });
    if (isNaN(currentPage) || currentPage <= 0)
      return res.status(400).json({ error: "Invalid page" });

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
    });

    orders.forEach(
      (order) =>
        (order.total_amount = formatPriceForClient(order.total_amount)),
    );

    return res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
}

export async function makeOrder(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id!;
  const currency: CurrencyISO = req.cookies.currency ?? "USD";

  try {
    const shoppingCart = await prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!shoppingCart)
      return res.status(404).json({ message: "Shopping Cart not found" });

    if (shoppingCart.items.length === 0) {
      return res.status(400).json({ message: "No Items in Cart" });
    }

    const line_items = await Promise.all(
      shoppingCart.items.map(async (item) => {
        const exchange = await exchangeToCurrencyInCents(
          item.product.currency,
          item.product.price,
          currency,
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
      }),
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
      //make
      cancel_url: `${CLIENT_ORIGIN}/cart?cancelOrderId=${order.id}`,
      billing_address_collection: "required",
      metadata: {
        orderId: order.id,
        userId,
      },
    });

    //reserve products
    await prisma.$transaction(
      shoppingCart.items.map((item) =>
        prisma.product.update({
          where: { id: item.product.id },
          data: {
            stock_quantity: {
              decrement: item.quantity,
            },
          },
        }),
      ),
    );

    return res.status(200).json({ sessionId: session.id });
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id!;
  const orderId = req.params.orderId;

  if (!orderId)
    return res.status(400).json({ message: "No order id provided" });

  try {
    const orderItems = await prisma.order_Item.findMany({
      where: { order_id: orderId },
    });

    await prisma.$transaction(
      orderItems.map((item) =>
        prisma.product.update({
          where: { id: item.product_id },
          data: { stock_quantity: { increment: item.quantity } },
        }),
      ),
    );
    if (orderItems.length === 0)
      return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({ message: "Order cancelled" });
  } catch (err) {
    next(err);
  }
}
