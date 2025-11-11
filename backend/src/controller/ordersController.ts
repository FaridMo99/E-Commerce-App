import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import { formatPriceForClient } from "../lib/currencyHandlers.js";

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

    orders.forEach(order => order.total_amount = formatPriceForClient(order.total_amount))

    return res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
}
