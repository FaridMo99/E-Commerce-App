import { ProductsMetaInfosQuerySchema, ProductsQuerySchema, ReviewSchema } from "@monorepo/shared";
import { handleResponse } from "../utils";
import { apiBaseUrl } from "@/config/constants";
import { AccessToken, AdminProduct, AuthProductReview, HomeProducts, Product, ProductMetaInfos, ProductReview } from "@/types/types";
import { getCsrfHeaderClientSide } from "@/lib/helpers";


export async function getProducts(
  queryParam?: ProductsQuerySchema,
): Promise<Product[]> {

  const params = new URLSearchParams();

  if (queryParam) {
      params.set("page", String(queryParam.page ?? 1));
      params.set("limit", String(queryParam.limit ?? 10));
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

export async function getProductsAdmin(
    accessToken:AccessToken,
  queryParam?: ProductsQuerySchema,
): Promise<AdminProduct[]> {
  const params = new URLSearchParams();

  if (queryParam) {
    params.set("page", String(queryParam.page ?? 1));
    params.set("limit", String(queryParam.limit ?? 10));
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
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}

export async function getProductsMetaInfos(
  queryParams?: ProductsMetaInfosQuerySchema
): Promise<ProductMetaInfos> {

  const params = new URLSearchParams();

  if (queryParams) {
    if (queryParams.page !== undefined)
      params.set("page", String(queryParams.page));
    if (queryParams.limit !== undefined)
      params.set("limit", String(queryParams.limit));
    if (queryParams.search) params.set("search", queryParams.search);
    if (queryParams.category) params.set("category", queryParams.category);
    if (queryParams.minPrice !== undefined)
      params.set("minPrice", String(queryParams.minPrice));
    if (queryParams.maxPrice !== undefined)
      params.set("maxPrice", String(queryParams.maxPrice));
    if (queryParams.sale !== undefined)
      params.set("sale", String(queryParams.sale));
  }

  const url = `${apiBaseUrl}/products/meta?${params.toString()}`;

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
