import { ProductsQuerySchema, ReviewSchema } from "@monorepo/shared";
import { handleResponse } from "../utils";
import { apiBaseUrl } from "@/config/constants";
import { AccessToken, AuthProductReview, HomeProducts, Product, ProductReview } from "@/types/types";
import { getCsrfHeaderClientSide } from "@/lib/helpers";


export async function getProducts(
  queryParam?: ProductsQuerySchema,
): Promise<Product[]> {

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

  const res = await fetch(url, {
    credentials: "include",
  });
  return await handleResponse(res);
}

export async function getProductByProductId(id: string): Promise<Product> {

  const res = await fetch(`${apiBaseUrl}/products/${id}`, {
    credentials: "include",
  });
  return await handleResponse(res);
}

export async function getAllProductReviewsByProductId(id: string): Promise<ProductReview[]> {

  const res = await fetch(`${apiBaseUrl}/products/${id}/reviews`);
  return await handleResponse(res);
}

export async function createProductReviewByProductId(
  id: string,
  content: ReviewSchema,
  accessToken:AccessToken
): Promise<AuthProductReview[]> {

  const res = await fetch(`${apiBaseUrl}/products/${id}/reviews`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(content),
  });
  return await handleResponse(res);
}

export async function getHomeProducts(accessToken?: AccessToken): Promise<HomeProducts> {
  
  const res = await fetch(`${apiBaseUrl}/products/home`, {
    credentials: "include",
    headers: {
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });
  return await handleResponse(res);
}
