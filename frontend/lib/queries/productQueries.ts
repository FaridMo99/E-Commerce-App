//this is the error handling for react query, maybe nextjs expects it differently
//include cookies for currency

import { ProductsQuerySchema, ReviewSchema } from "@monorepo/shared";
import { handleResponse } from "./utils";

export const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
export const apiBaseUrl = baseUrl + "/api";

export async function getProducts(queryParam?: ProductsQuerySchema): Promise<> {
  const params = new URLSearchParams();

  if (queryParam) {
    if (queryParam.page !== undefined)
      params.set("page", String(queryParam.page));
    if (queryParam.limit !== undefined)
      params.set("limit", String(queryParam.limit));
    if (queryParam.search) params.set("search", queryParam.search);
    if (queryParam.category) params.set("category", queryParam.category);
    if (queryParam.minPrice !== undefined)
      params.set("minPrice", String(queryParam.minPrice));
    if (queryParam.maxPrice !== undefined)
      params.set("maxPrice", String(queryParam.maxPrice));
    if (queryParam.sale !== undefined)
      params.set("sale", String(queryParam.sale));
    if (queryParam.sortBy) params.set("sortBy", queryParam.sortBy);
    if (queryParam.sortOrder) params.set("sortOrder", queryParam.sortOrder);
  }

  const url = `${apiBaseUrl}/products?${params.toString()}`;

  const res = await fetch(url, { credentials: "include" });
  return await handleResponse(res);
}

export async function getProductByProductId(id: string): Promise<> {
  const res = await fetch(`${apiBaseUrl}/products/${id}`, {
    credentials: "include",
  });
  return await handleResponse(res);
}

export async function getAllProductReviewsByProductId(id: string): Promise<> {
  const res = await fetch(`${apiBaseUrl}/products/${id}/reviews`);
  return await handleResponse(res);
}

export async function createProductReviewByProductId(
  id: string,
  content: ReviewSchema,
): Promise<> {
  const res = await fetch(`${apiBaseUrl}/products/${id}/reviews`, {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
  return await handleResponse(res);
}
