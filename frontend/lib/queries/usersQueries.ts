import {
  AddCartItemSchema,
  ItemQuantitySchema,
  OrdersQuerySchema,
  UpdateUserSchema,
} from "@monorepo/shared";
import { handleResponse } from "./utils";
import { apiBaseUrl } from "@/config/constants";

export async function getUser(): Promise<> {
  const res = await fetch(`${apiBaseUrl}/users/me`, { credentials: "include" });
  return await handleResponse(res);
}

export async function updateUser(content: UpdateUserSchema): Promise<> {
  const res = await fetch(`${apiBaseUrl}/users/me`, {
    credentials: "include",
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
  return await handleResponse(res);
}

export async function deleteUser(): Promise<> {
  const res = await fetch(`${apiBaseUrl}/users/me`, {
    credentials: "include",
    method: "DELETE",
  });
  return await handleResponse(res);
}

export async function getUserCart(): Promise<> {
  const res = await fetch(`${apiBaseUrl}/users/me/cart`, {
    credentials: "include",
  });
  return await handleResponse(res);
}

export async function deleteUserCart(): Promise<> {
  const res = await fetch(`${apiBaseUrl}/users/me/cart`, {
    credentials: "include",
    method: "DELETE",
  });
  return await handleResponse(res);
}

export async function addProductToUserCart(
  product: AddCartItemSchema,
): Promise<> {
  const res = await fetch(`${apiBaseUrl}/users/me/cart/items`, {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return await handleResponse(res);
}

export async function removeItemFromCart(itemId: string): Promise<> {
  const res = await fetch(`${apiBaseUrl}/users/me/cart/items/${itemId}`, {
    credentials: "include",
    method: "POST",
  });
  return await handleResponse(res);
}

export async function changeItemQuantitiy(
  itemQuantity: ItemQuantitySchema,
  itemId: string,
): Promise<> {
  const res = await fetch(`${apiBaseUrl}/users/me/cart/items/${itemId}`, {
    credentials: "include",
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(itemQuantity),
  });
  return await handleResponse(res);
}

export async function getUserReviews(): Promise<> {
  const res = await fetch(`${apiBaseUrl}/users/me/reviews`, {
    credentials: "include",
  });
  return await handleResponse(res);
}

export async function getUserOrders(queryParam?: OrdersQuerySchema): Promise<> {
  const params = new URLSearchParams();

  if (queryParam) {
    if (queryParam.page !== undefined)
      params.set("page", String(queryParam.page));
    if (queryParam.limit !== undefined)
      params.set("limit", String(queryParam.limit));
    if (queryParam.order) params.set("order", queryParam.order);
    if (queryParam.sort) params.set("sort", queryParam.sort);
    if (queryParam.status !== undefined)
      params.set("status", String(queryParam.status));
  }

  const url = `${apiBaseUrl}/users/me/orders?${params.toString()}`;

  const res = await fetch(url, { credentials: "include" });

  return await handleResponse(res);
}

export async function getUserOrderByOrderId(id: string): Promise<> {
  const res = await fetch(`${apiBaseUrl}/users/me/orders/${id}`, {
    credentials: "include",
  });
  return await handleResponse(res);
}

export async function getUserFavoriteItems(): Promise<> {
  const res = await fetch(`${apiBaseUrl}/users/me/favorites`, {
    credentials: "include",
  });
  return await handleResponse(res);
}

export async function addFavoriteItemByProductId(productId: string): Promise<> {
  const res = await fetch(`${apiBaseUrl}/users/me/favorites`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId }),
  });
  return await handleResponse(res);
}

export async function deleteFavoriteItemByProductId(
  productId: string,
): Promise<> {
  const res = await fetch(`${apiBaseUrl}/users/me/favorites/${productId}`, {
    credentials: "include",
    method: "DELETE",
  });
  return await handleResponse(res);
}
