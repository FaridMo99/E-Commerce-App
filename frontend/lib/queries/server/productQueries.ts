"use server"
import { ProductsMetaInfosQuerySchema, ProductsQuerySchema, ReviewSchema } from "@monorepo/shared";
import { handleResponse } from "../utils";
import { apiBaseUrl } from "@/config/constants";
import { AccessToken, AuthProductReview, HomeProducts, Product, ProductMetaInfos, ProductReview } from "@/types/types";
import { getAllHeaders, getCsrfHeader } from "../../serverHelpers";


export async function getProducts(
  queryParams?: ProductsQuerySchema,
): Promise<Product[]> {
  const additionalHeaders = await getAllHeaders()

  const params = new URLSearchParams();

  if (queryParams) {
      params.set("page", String(queryParams.page ?? 1));
      params.set("limit", String(queryParams.limit ?? 10));
    if (queryParams.search) params.set("search", queryParams.search);
    if (queryParams.category) params.set("category", queryParams.category);
    if (queryParams.minPrice !== undefined)
      params.set("minPrice", String(queryParams.minPrice * 100));
    if (queryParams.maxPrice !== undefined)
      params.set("maxPrice", String(queryParams.maxPrice * 100));
    if (queryParams.sale !== undefined)
      params.set("sale", String(queryParams.sale));
    if (queryParams.sortBy) params.set("sortBy", queryParams.sortBy);
    if (queryParams.sortOrder) params.set("sortOrder", queryParams.sortOrder);
  }

  const url = `${apiBaseUrl}/products?${params.toString()}`;

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      ...additionalHeaders,
    },
  });
  return await handleResponse(res);
}

export async function getProductsMetaInfos(
  queryParams?: ProductsMetaInfosQuerySchema
): Promise<ProductMetaInfos> {
  const additionalHeaders = await getAllHeaders();

  const params = new URLSearchParams();

  if (queryParams) {
    if (queryParams.page !== undefined)
      params.set("page", String(queryParams.page));
    if (queryParams.limit !== undefined)
      params.set("limit", String(queryParams.limit));
    if (queryParams.search) params.set("search", queryParams.search);
    if (queryParams.category) params.set("category", queryParams.category);
    if (queryParams.minPrice !== undefined)
      params.set("minPrice", String(queryParams.minPrice * 100));
    if (queryParams.maxPrice !== undefined)
      params.set("maxPrice", String(queryParams.maxPrice * 100));
    if (queryParams.sale !== undefined)
      params.set("sale", String(queryParams.sale));
  }

  const url = `${apiBaseUrl}/products/meta?${params.toString()}`;

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      ...additionalHeaders,
    },
  });
  return await handleResponse(res);
}

export async function getProductByProductId(id: string): Promise<Product> {
    const additionalHeaders = await getAllHeaders();

  const res = await fetch(`${apiBaseUrl}/products/${id}`, {
    credentials: "include",
    headers: {
      ...additionalHeaders,
    },
  });
  return await handleResponse(res);
}

export async function getAllProductReviewsByProductId(id: string): Promise<ProductReview[]> {
    const additionalHeaders = await getAllHeaders();

  const res = await fetch(`${apiBaseUrl}/products/${id}/reviews`, {
    headers: {
      ...additionalHeaders,
    },
  });
  return await handleResponse(res);
}

export async function createProductReviewByProductId(
  id: string,
  content: ReviewSchema,
  accessToken:AccessToken
): Promise<AuthProductReview[]> {
  const [additionalHeaders, csrfHeader] = await Promise.all([
    getAllHeaders(),
    getCsrfHeader(),
  ]);

  const res = await fetch(`${apiBaseUrl}/products/${id}/reviews`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeader,
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders
    },
    body: JSON.stringify(content),
  });
  return await handleResponse(res);
}

export async function getHomeProducts(accessToken?: AccessToken): Promise<HomeProducts> {
  const additionalHeaders = await getAllHeaders();
  console.log(additionalHeaders);
  const res = await fetch(`${apiBaseUrl}/products/home`, {
    credentials: "include",
    headers: {
      ...additionalHeaders,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });
  return await handleResponse(res);
}
