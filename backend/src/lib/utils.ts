import type { DailyRevenue } from "@monorepo/shared";
import type {
  CartWithSelectedFields,
} from "../config/prismaHelpers.js";
import type { CartWithTotals, JWTUserPayload } from "../types/types.js";

export const getTimestamp = () =>
  `[${new Date().toISOString().replace("T", ", ").replace("Z", "")}]`;


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

export function isValidUserPayload(payload:any): payload is JWTUserPayload {
  return (
    payload &&
    typeof payload.id === "string" &&
    typeof payload.role === "string"
  );
}