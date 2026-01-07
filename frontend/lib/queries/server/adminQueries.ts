"user server"

import {
  OrdersQuerySchema,
  ProductSchema,
  TimeframeQuerySchema,
  UpdateProductSchema,
} from "@monorepo/shared";
import { API_BASE_URL } from "@/config/constants";
import { SettingsSchema } from "@monorepo/shared";
import { handleResponse } from "../utils";
import {
  AccessToken,
  AdminNewUser,
  AdminRevenue,
  AdminSetting,
  AdminTopseller,
  Order,
  ProductCategory,
} from "@/types/types";
import { getAllHeaders, getCsrfHeader } from "../../serverHelpers";

//analytics
export async function getRevenue( accessToken:AccessToken,timeframe?: TimeframeQuerySchema): Promise<AdminRevenue> {
  const params = new URLSearchParams();

  if (timeframe) {
    if (timeframe.from) params.set("from", String(timeframe.from));
    if (timeframe.to) params.set("to", String(timeframe.to));
  }

  const url = `${API_BASE_URL}/admin/analytics/revenue?${params.toString()}`;

  const additionalHeaders = await getAllHeaders()

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders
    },
  });

  return await handleResponse(res);
}

export async function getTopsellers(
    accessToken: AccessToken,
  timeframe?: TimeframeQuerySchema
): Promise<AdminTopseller> {
  const params = new URLSearchParams();

  if (timeframe) {
    if (timeframe.from) params.set("from", String(timeframe.from));
    if (timeframe.to) params.set("to", String(timeframe.to));
  }

  const url = `${API_BASE_URL}/admin/analytics/topsellers?${params.toString()}`;

  const additionalHeaders = await getAllHeaders()

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders
    },
  });

  return await handleResponse(res);
}

export async function getNewUsers(accessToken:AccessToken,timeframe?: TimeframeQuerySchema): Promise<AdminNewUser> {
  const params = new URLSearchParams();

  if (timeframe) {
    if (timeframe.from) params.set("from", String(timeframe.from));
    if (timeframe.to) params.set("to", String(timeframe.to));
  }

  const url = `${API_BASE_URL}/admin/analytics/new-users?${params.toString()}`;

  const additionalHeaders = await getAllHeaders()

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders
    },
  });

  return await handleResponse(res);
}

//settings
export async function getAllSettings(accessToken: AccessToken): Promise<AdminSetting[]> {
  const additionalHeaders = await getAllHeaders()
  const res = await fetch(`${API_BASE_URL}/settings`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders
    },
  });

  return await handleResponse(res);
}

export async function createSetting(setting: SettingsSchema, accessToken: AccessToken): Promise<AdminSetting> {
  const [additionalHeaders, csrfHeader] = await Promise.all([
    getAllHeaders(),
    getCsrfHeader(),
  ]);


  const res = await fetch(`${API_BASE_URL}/settings`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeader,
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders
    },
    body: JSON.stringify(setting),
  });
  return await handleResponse(res);
}

export async function getSettingBySettingId(id: string, accessToken: AccessToken): Promise<AdminSetting> {
    const additionalHeaders = await getAllHeaders();
  const res = await fetch(`${API_BASE_URL}/settings/${id}`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders
    }
  });
  return await handleResponse(res);
}

export async function deleteAllSettings(accessToken: AccessToken): Promise<void> {
  const [additionalHeaders, csrfHeader] = await Promise.all([
    getAllHeaders(),
    getCsrfHeader(),
  ]);


  const res = await fetch(`${API_BASE_URL}/settings`, {
    credentials: "include",
    method: "DELETE",
    headers: {
      ...csrfHeader,
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders,
    },
  });
  return await handleResponse(res);
}

export async function deleteSettingBySettingId(id: string, accessToken: AccessToken): Promise<void> {
  const [additionalHeaders, csrfHeader] = await Promise.all([
    getAllHeaders(),
    getCsrfHeader(),
  ]);


  const res = await fetch(`${API_BASE_URL}/settings/${id}`, {
    credentials: "include",
    method: "DELETE",
    headers: {
      ...csrfHeader,
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders,
    },
  });
  return await handleResponse(res);
}

export async function updateSettingBySettingId(
  id: string,
  content: SettingsSchema,
  accessToken:AccessToken
): Promise<AdminSetting> {
  const [additionalHeaders, csrfHeader] = await Promise.all([
    getAllHeaders(),
    getCsrfHeader(),
  ]);


  const res = await fetch(`${API_BASE_URL}/settings/${id}`, {
    credentials: "include",
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeader,
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders,
    },
    body: JSON.stringify(content),
  });

  return await handleResponse(res);
}

//products
//check how to do with images
export async function createProduct(content: ProductSchema, accessToken: AccessToken): Promise<void> {
  const [additionalHeaders, csrfHeader] = await Promise.all([
    getAllHeaders(),
    getCsrfHeader(),
  ]);


  const res = await fetch(`${API_BASE_URL}/products`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeader,
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders,
    },
    body: JSON.stringify(content),
  });
  await handleResponse(res);
}

export async function deleteProductByProductId(id: string, accessToken: AccessToken): Promise<void> {
  const [additionalHeaders, csrfHeader] = await Promise.all([
    getAllHeaders(),
    getCsrfHeader(),
  ]);


  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    credentials: "include",
    method: "DELETE",
    headers: {
      ...csrfHeader,
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders,
    },
  });
  return await handleResponse(res);
}

export async function updateProductByProductId(
  id: string,
  content: UpdateProductSchema,
  accessToken:AccessToken
): Promise<void> {
  const [additionalHeaders, csrfHeader] = await Promise.all([
    getAllHeaders(),
    getCsrfHeader(),
  ]);



  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    credentials: "include",
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeader,
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders,
    },
    body: JSON.stringify(content),
  });
  await handleResponse(res);
}

//orders
//order search queries type could be wrong since user also uses it
export async function getOrders(
  accessToken:AccessToken,
  timeframe?: TimeframeQuerySchema,
  queryParam?: OrdersQuerySchema,
): Promise<Order[]> {
    const additionalHeaders = await getAllHeaders();

  const params = new URLSearchParams();

  if (queryParam) {
    if (queryParam.page) params.set("page", String(queryParam.page));
    if (queryParam.limit) params.set("limit", String(queryParam.limit));
    if (queryParam.order) params.set("order", queryParam.order);
    if (queryParam.sort) params.set("sortBy", queryParam.sort);
    if (queryParam.order) params.set("sortOrder", String(queryParam.order));
  }

  if (timeframe) {
    if (timeframe.from) params.set("from", String(timeframe.from));
    if (timeframe.to) params.set("to", String(timeframe.to));
  }

  const url = `${API_BASE_URL}/orders?${params.toString()}`;

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders,
    },
  });

  return await handleResponse(res);
}

//categories
export async function createCategory(category: string, accessToken: AccessToken): Promise<ProductCategory> {
  const [additionalHeaders, csrfHeader] = await Promise.all([
    getAllHeaders(),
    getCsrfHeader(),
  ]);


  const res = await fetch(`${API_BASE_URL}/categories`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeader,
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders,
    },
    body: JSON.stringify({ category }),
  });
  return await handleResponse(res);
}

export async function deleteCategoryByCategoryId(id: string, accessToken: AccessToken): Promise<void> {
  const [additionalHeaders, csrfHeader] = await Promise.all([
    getAllHeaders(),
    getCsrfHeader(),
  ]);


  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    credentials: "include",
    method: "DELETE",
    headers: {
      ...csrfHeader,
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders,
    },
  });
  return await handleResponse(res);
}
