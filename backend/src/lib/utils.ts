import type { DailyRevenue } from "@monorepo/shared";
import type { CartWithSelectedFields, ProductWithSelectedFields } from "../config/prismaHelpers.js";
import { formatPriceForClient } from "./currencyHandlers.js";
import type { Cart, CartItem, Product } from "../generated/prisma/client.js";
import prisma from "../services/prisma.js";

export const getTimestamp = () =>
  `[${new Date().toISOString().replace("T", ", ").replace("Z", "")}]`;

type ProductWithAvgRating = ProductWithSelectedFields & {
  averageRating: number;
};

export function calcAvgRating(product: ProductWithSelectedFields) {
  const ratings = product.reviews?.map((r) => r.rating) ?? [];

  (product as ProductWithAvgRating).averageRating =
    ratings.length === 0
      ? 0
      : ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;

  delete (product as { reviews?: any }).reviews;
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


export type CartProduct = {
  id: string;
  name: string;
  price: number;
  sale_price?: number | null;
  currency: "USD" | "GBP" | "EUR";
  stock_quantity: number;
};

export type CartItemWithTotal = {
  id: string;
  quantity: number;
  product: CartProduct;
  total?: number;
};

export type CartWithTotals = {
  id: string;
  items: CartItemWithTotal[];
  total?: number;
};

export function calculateCartTotalsInCents(
  cart: CartWithSelectedFields
): CartWithTotals {
    let cartTotal = 0;

    cart.items.forEach((item) => {
      const price = item.product.sale_price ?? item.product.price;
      const itemTotal = price * item.quantity;
      cartTotal += itemTotal;
      item.total = Number(itemTotal.toFixed(2)) * 100;
    });
    cart.total = Number(cartTotal.toFixed(2)) * 100;

    return cart;
}

export function calculateCartTotals(cart: CartWithSelectedFields): CartWithTotals {
  let cartTotal = 0;

  cart.items.forEach((item) => {
    const price = item.product.sale_price ?? item.product.price;
    const itemTotal = price * item.quantity;
    cartTotal += itemTotal;
    item.total = Number(itemTotal.toFixed(2));
  });
  cart.total = Number(cartTotal.toFixed(2));

  return cart;
}

export async function releaseCartItems(orderId:string) {
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