import type { DailyRevenue } from "@monorepo/shared";
import type {
  CartItemWithSelectedFields,
  CartWithSelectedFields,
  ProductWithSelectedFields,
} from "../config/prismaHelpers.js";
import { formatPriceForClient } from "./currencyHandlers.js";
import prisma from "../services/prisma.js";
import stripe from "../services/stripe.js";
import type Stripe from "stripe";
import chalk from "chalk";
import type { CurrencyISO } from "../generated/prisma/enums.js";
import { notifyAdmin } from "../services/email.js";
import type { CartWithTotals, JWTUserPayload } from "../types/types.js";

export const getTimestamp = () =>
  `[${new Date().toISOString().replace("T", ", ").replace("Z", "")}]`;

type ProductWithAvgRating = ProductWithSelectedFields & {
  averageRating?: number;
};

export function calcAvgRating(product: ProductWithAvgRating) {
  const ratings = product.reviews?.map((r) => r.rating) ?? [];

  product.averageRating =
    ratings.length === 0
      ? 0
      : ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
}

type OrderSmall = {
  total_amount: number;
  ordered_at: Date;
};

export function getDailyRevenue(orders: OrderSmall[]): DailyRevenue[] {
  if (orders.length === 0) return [];

  const revenueMap: Record<string, number> = {};

  // Aggregate revenue per day
  for (const order of orders) {
    const day = order.ordered_at.toISOString().slice(0, 10);
    revenueMap[day] = (revenueMap[day] || 0) + order.total_amount;
  }

  // Find the date range
  const dates = orders.map((o) => o.ordered_at.getTime());
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  // Fill every day in the range
  const dailyRevenue: DailyRevenue[] = [];
  const current = new Date(minDate);

  while (current <= maxDate) {
    const dayStr = current.toISOString().slice(0, 10);
    const amount = revenueMap[dayStr] || 0;

    dailyRevenue.push({
      day: dayStr,
      revenue: formatPriceForClient(amount),
    });

    current.setDate(current.getDate() + 1);
  }

  return dailyRevenue;
}

export function getTotalRevenue(dailyRevenue: DailyRevenue[]): number {
  return dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);
}


export function calculateCartTotalsInCents(cart: CartWithSelectedFields): CartWithTotals {
  let cartTotal = 0;

  const itemsWithTotals = cart.items.map((item) => {
    const price = item.product.sale_price ?? item.product.price;
    const itemTotal = price * item.quantity;
    cartTotal += itemTotal;

    return {
      ...item,
      total: Number(itemTotal.toFixed(2)) * 100,
    };
  });


  return {
    ...cart,
    items: itemsWithTotals,
    total: Number(cartTotal.toFixed(2)) * 100,
  };
}

export function calculateCartTotals(
  cart: CartWithSelectedFields
): CartWithTotals {
  let cartTotal = 0;

  const itemsWithTotals = cart.items.map((item) => {
    const price = item.product.sale_price ?? item.product.price;
    const itemTotal = price * item.quantity;
    cartTotal += itemTotal;

    return {
      ...item,
      total: Number(itemTotal.toFixed(2)),
    };
  });

  return {
    ...cart,
    items: itemsWithTotals,
    total: Number(cartTotal.toFixed(2)),
  };
}


export async function releaseCartItems(orderId: string) {
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
}

export async function refundOrder(
  paymentIntentId: string,
  amount: number,
  currency: CurrencyISO
): Promise<Stripe.Response<Stripe.Refund> | void> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount,
      reason: "requested_by_customer",
      currency,
    });

    return refund;
  } catch (error) {
    console.log(chalk.red(getTimestamp(), "Refund failed:", error));
    await notifyAdmin(
      `Failed to create a refund for PaymentIntentId ${paymentIntentId}. Please go to your Stripe Dashboard and handle that case manually`
    );
  }
}

export function isValidUserPayload(payload:any): payload is JWTUserPayload {
  return (
    payload &&
    typeof payload.id === "string" &&
    typeof payload.role === "string"
  );
}