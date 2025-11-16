import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import { sortOrderSchema } from "@monorepo/shared";
import { formatPriceForClient } from "../lib/currencyHandlers.js";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";

export async function getRevenue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { from, to } = req.timeframe!;

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Fetching revenue from ${from} to ${to}...`
      )
    );

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
      revenue._sum.total_amount ?? 0
    );

    console.log(
      chalk.green(
        `${getTimestamp()} Revenue fetched successfully: ${revenue._sum.total_amount}`
      )
    );
    return res.status(200).json(revenue);
  } catch (err) {
    console.log(chalk.red(`${getTimestamp()} Failed to fetch revenue:`, err));
    next(err);
  }
}

export async function getTopsellers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { from, to } = req.timeframe!;
  const { sortOrder = "desc", limit = 10 } = req.query;

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Fetching top sellers from ${from} to ${to}, sortOrder: ${sortOrder}, limit: ${limit}`
      )
    );

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

    const productsWithSales = products.map((p) => ({
      product: p,
      totalSold: p.order_items.reduce((sum, oi) => sum + oi.quantity, 0),
      price: formatPriceForClient(p.price),
      sale_price: p.sale_price
        ? formatPriceForClient(p.sale_price)
        : p.sale_price,
    }));

    productsWithSales.sort((a, b) =>
      orderBy === "asc" ? a.totalSold - b.totalSold : b.totalSold - a.totalSold
    );

    const topSellers = productsWithSales.slice(0, Number(limit));

    console.log(
      chalk.green(
        `${getTimestamp()} Top sellers fetched successfully. Count: ${topSellers.length}`
      )
    );
    res.json(topSellers);
  } catch (error) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to fetch top sellers:`, error)
    );
    next(error);
  }
}

export async function getNewUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { from, to } = req.timeframe!;

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Counting new users from ${from} to ${to}...`
      )
    );

    const userCount = await prisma.user.count({
      where: { created_at: { ...(from && { gte: from }), lte: to } },
    });

    console.log(
      chalk.green(`${getTimestamp()} New users count fetched: ${userCount}`)
    );
    return res.status(200).json(userCount);
  } catch (err) {
    console.log(chalk.red(`${getTimestamp()} Failed to fetch new users:`, err));
    next(err);
  }
}
