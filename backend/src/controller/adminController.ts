import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import { sortOrderSchema } from "@monorepo/shared";


export async function getRevenue(req: Request, res: Response, next: NextFunction) { 
  //exists for sure here because of the middleware
  const { from, to } = req.timeframe!
  
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

    return res.status(200).json(revenue)
  } catch (err) {
    next(err)
  }
}


export async function getOrders(
  req: Request,
  res: Response,
  next: NextFunction
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

    return res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
}
export async function getTopsellers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { from, to } = req.timeframe!; // already validated by middleware
    const { sortOrder = "desc", limit = 10 } = req.query;

    // Validate sortOrder
    const validatedOrder = sortOrderSchema.safeParse(sortOrder);
    const orderBy = validatedOrder.data ?? "desc"

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
    }));

    // Sort by total sold
    productsWithSales.sort((a, b) =>
      orderBy === "asc"
        ? a.totalSold - b.totalSold
        : b.totalSold - a.totalSold
    );

    // Limit results
    const topSellers = productsWithSales.slice(0, Number(limit));

    res.json(topSellers);
  } catch (error) {
    next(error);
  }
}

export async function getNewUsers(req: Request, res: Response, next: NextFunction) { 
  const { from, to } = req.timeframe!
  
  try {
    const userCount = await prisma.user.count({
      where: { created_at: { ...(from && { gte: from }), lte: to } },
    });

    return res.status(200).json(userCount)
  } catch (err) {
    next(err)
  }
}