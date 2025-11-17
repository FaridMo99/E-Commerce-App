"use server";

import {
  AddCartItemSchema,
  ItemQuantitySchema,
  OrdersQuerySchema,
  UpdateUserSchema,
} from "@monorepo/shared";
import { handleResponse } from "./utils";
import { apiBaseUrl } from "@/config/constants";
import { AccessToken, AuthProductReview, Cart, Order, Product, User } from "@/types/types";
import { getCsrfHeader } from "../helpers";

export async function getUser(): Promise<User> {
  const res = await fetch(`${apiBaseUrl}/users/me`, { credentials: "include" });
  return await handleResponse(res);
}


//every isauthenticated route need authz bearer token header
export async function updateUser(
  content: UpdateUserSchema,
  accessToken: AccessToken
): Promise<User> {
  const res = await fetch(`${apiBaseUrl}/users/me`, {
    credentials: "include",
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getCsrfHeader(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(content),
  });
  return await handleResponse(res);
}

export async function deleteUser(accessToken: AccessToken): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/users/me`, {
    credentials: "include",
    method: "DELETE",
    headers: {
      ...getCsrfHeader(),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}

export async function getUserCart(accessToken: AccessToken): Promise<Cart> {
  const res = await fetch(`${apiBaseUrl}/users/me/cart`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}

export async function deleteUserCart(accessToken: AccessToken): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/users/me/cart`, {
    credentials: "include",
    method: "DELETE",
    headers: {
      ...getCsrfHeader(),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}

export async function addProductToUserCart(
  product: AddCartItemSchema,
  accessToken: AccessToken
): Promise<Cart> {
  const res = await fetch(`${apiBaseUrl}/users/me/cart/items`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getCsrfHeader(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(product),
  });
  return await handleResponse(res);
}

export async function removeItemFromCart(
  itemId: string,
  accessToken: AccessToken
): Promise<Cart> {
  const res = await fetch(`${apiBaseUrl}/users/me/cart/items/${itemId}`, {
    credentials: "include",
    method: "POST",
    headers: {
      ...getCsrfHeader(),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}

export async function changeItemQuantitiy(
  itemQuantity: ItemQuantitySchema,
  itemId: string,
  accessToken: AccessToken
): Promise<Cart> {
  const res = await fetch(`${apiBaseUrl}/users/me/cart/items/${itemId}`, {
    credentials: "include",
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getCsrfHeader(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(itemQuantity),
  });
  return await handleResponse(res);
}

export async function getUserReviews(
  accessToken: AccessToken
): Promise<AuthProductReview[]> {
  const res = await fetch(`${apiBaseUrl}/users/me/reviews`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}

export async function getUserOrders(
    accessToken: AccessToken,
  queryParam?: OrdersQuerySchema
): Promise<Order[]> {
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

  const res = await fetch(url, {
    credentials: "include",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return await handleResponse(res);
}

export async function getUserOrderByOrderId(
  id: string,
  accessToken: AccessToken
): Promise<Order> {
  const res = await fetch(`${apiBaseUrl}/users/me/orders/${id}`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}

export async function getUserFavoriteItems(
  accessToken: AccessToken
): Promise<Product[]> {
  const res = await fetch(`${apiBaseUrl}/users/me/favorites`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}

export async function addFavoriteItemByProductId(
  productId: string,
  accessToken: AccessToken
): Promise<Product> {
  const res = await fetch(`${apiBaseUrl}/users/me/favorites`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getCsrfHeader(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ productId }),
  });
  return await handleResponse(res);
}

export async function deleteFavoriteItemByProductId(
  productId: string,
  accessToken: AccessToken
): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/users/me/favorites/${productId}`, {
    credentials: "include",
    method: "DELETE",
    headers: {
      ...getCsrfHeader(),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}
