import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import { sortOrderSchema } from "@monorepo/shared";
import { formatPriceForClient } from "../lib/currencyHandlers.js";

export async function getRevenue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  //exists for sure here because of the middleware
  const { from, to } = req.timeframe!;

  try {
    const revenue = await prisma.order.aggregate({
      _sum: { total_amount: true },
      where: {
        ordered_at: {
          ...(from && { gte: from }),
          lte: to,
        },
        payment: { status: "COMPLETED" },
      },
    });

    revenue._sum.total_amount = formatPriceForClient(
      revenue._sum.total_amount ?? 0,
    );
    return res.status(200).json(revenue);
  } catch (err) {
    next(err);
  }
}

export async function getTopsellers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { from, to } = req.timeframe!; // already validated by middleware
    const { sortOrder = "desc", limit = 10 } = req.query;

    // Validate sortOrder
    const validatedOrder = sortOrderSchema.safeParse(sortOrder);
    const orderBy = validatedOrder.data ?? "desc";

    const products = await prisma.product.findMany({
      where: {
        order_items: {
          some: {
            order: {
              ordered_at: {
                ...(from && { gte: from }),
                lte: to,
              },
            },
          },
        },
      },
      include: {
        order_items: {
          where: {
            order: {
              ordered_at: {
                ...(from && { gte: from }),
                lte: to,
              },
            },
          },
          select: {
            quantity: true,
          },
        },
      },
    });

    // Calculate total sold per product
    const productsWithSales = products.map((p) => ({
      product: p,
      totalSold: p.order_items.reduce((sum, oi) => sum + oi.quantity, 0),
      price: formatPriceForClient(p.price),
      sale_price: p.sale_price
        ? formatPriceForClient(p.sale_price)
        : p.sale_price,
    }));

    // Sort by total sold
    productsWithSales.sort((a, b) =>
      orderBy === "asc" ? a.totalSold - b.totalSold : b.totalSold - a.totalSold,
    );

    // Limit results
    const topSellers = productsWithSales.slice(0, Number(limit));

    res.json(topSellers);
  } catch (error) {
    next(error);
  }
}

export async function getNewUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { from, to } = req.timeframe!;

  try {
    const userCount = await prisma.user.count({
      where: { created_at: { ...(from && { gte: from }), lte: to } },
    });

    return res.status(200).json(userCount);
  } catch (err) {
    next(err);
  }
}
