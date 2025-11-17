//this is the error handling for react query, maybe nextjs expects it differently
//include cookies for currency
"use server"
import { ProductsQuerySchema, ReviewSchema } from "@monorepo/shared";
import { handleResponse } from "./utils";
import { apiBaseUrl } from "@/config/constants";
import { AccessToken, AuthProductReview, HomeProducts, Product, ProductReview } from "@/types/types";
import { getAllHeaders, getCsrfHeader } from "../serverHelpers";


export async function getProducts(
  queryParam?: ProductsQuerySchema,
): Promise<Product[]> {
  const additionalHeaders = await getAllHeaders()

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



//have to give accesstoken when logged in to get recently viewed ones
export async function getHomeProducts(): Promise<HomeProducts> {
  const res = await fetch(`${apiBaseUrl}/products/home`, {
    credentials: "include",
  });
  return await handleResponse(res);
}
