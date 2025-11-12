import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import {
  exchangeToCurrencyInCents,
  formatPriceForClient,
} from "../lib/currencyHandlers.js";
import type { CurrencyISO } from "../generated/prisma/enums.js";
import stripe from "../services/stripe.js";

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

    const formattedProducts = await Promise.all(
      shoppingCart.items.map(async (item) => {
        const exchange = await exchangeToCurrencyInCents(
          item.product.currency,
          item.product.price,
          currency,
        );
        item.product.currency = exchange.currency;
        item.product.price = exchange.exchangedPriceInCents;

        if (item.product.sale_price) {
          const saleExchange = await exchangeToCurrencyInCents(
            item.product.currency,
            item.product.sale_price,
            item.product.currency,
          );
          item.product.sale_price = saleExchange.exchangedPriceInCents;
        }

        return item;
      }),
    );

    const totalPrice = formattedProducts.reduce((sum, item) => {
      const price = item.product.sale_price ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice,
      currency,
    });

    return res.status(200).json(formattedProducts);
  } catch (err) {
    next(err);
  }
}
