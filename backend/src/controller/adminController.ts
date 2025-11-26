import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import { sortOrderSchema } from "@monorepo/shared";
import { transformAndFormatProductPrice } from "../lib/currencyHandlers.js";
import chalk from "chalk";
import { getDailyRevenue, getTimestamp, getTotalRevenue } from "../lib/utils.js";
import { productSelect } from "../config/prismaHelpers.js";
import { BASE_CURRENCY_KEY } from "../config/constants.js";


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

    const [orders, currency] = await Promise.all([
      prisma.order.findMany({
        where: {
          ordered_at: {
            ...(from && { gte: from }),
            lte: to,
          },
          payment: { status: "COMPLETED" },
        },
        select: {
          total_amount: true,
          ordered_at: true,
        },
        orderBy: {
          ordered_at: "asc",
        },
      }),
      prisma.settings.findUnique({ where: { key: BASE_CURRENCY_KEY } }),
    ]);

    console.log(chalk.green(`${getTimestamp()} Revenue fetched successfully`));

    const dailyRevenue = getDailyRevenue(orders);
    const totalRevenue = getTotalRevenue(dailyRevenue);
    const totalOrders = orders.length;

    return res
      .status(200)
      .json({ dailyRevenue, totalRevenue, currency: currency?.value, totalOrders});
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

    // Aggregate total sold per product
    const topSellers = await prisma.order_Item.groupBy({
      by: ["product_id"],
      where: {
        order: {
          ordered_at: {
            ...(from && { gte: from }),
            ...(to && { lte: to }),
          },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: orderBy === "asc" ? "asc" : "desc",
        },
      },
      take: Number(limit),
    });

    // Fetch product info for each top seller
    const productsWithInfo = await prisma.product.findMany({
      where: {
        id: { in: topSellers.map((s) => s.product_id) },
      },
      select: {
        name: true,
        imageUrls: true, 
        id:true
      },
    });

    // Map products to include total sold and formatted prices
    const response = topSellers.map((s) => {
      const product = productsWithInfo.find((p) => p.id === s.product_id)!;


    return {
      product,
      totalSold: s._sum.quantity ?? 0,
    };
    });

    console.log(
      chalk.green(
        `${getTimestamp()} Top sellers fetched successfully. Count: ${response.length}`
      )
    );
    res.json(response);
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
      where: {
        created_at: { ...(from && { gte: from }), lte: to }
      }
    });

    console.log(
      chalk.green(`${getTimestamp()} New users count fetched: ${userCount}`)
    );
    return res.status(200).json({count:userCount});
  } catch (err) {
    console.log(chalk.red(`${getTimestamp()} Failed to fetch new users:`, err));
    next(err);
  }
}
