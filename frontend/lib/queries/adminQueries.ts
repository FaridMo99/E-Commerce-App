//this whole file shouldnt be send when the user is not a admin
import {
  OrdersQuerySchema,
  ProductSchema,
  TimeframeQuerySchema,
  UpdateProductSchema,
} from "@monorepo/shared";
import { apiBaseUrl } from "./productQueries";
import { SettingsSchema } from "@monorepo/shared";
import { handleResponse } from "./utils";

//analytics
export async function getRevenue(timeframe?: TimeframeQuerySchema): Promise<> {
  const params = new URLSearchParams();

  if (timeframe) {
    if (timeframe.from) params.set("from", String(timeframe.from));
    if (timeframe.to) params.set("to", String(timeframe.to));
  }

  const url = `${apiBaseUrl}/admin/analytics/revenue?${params.toString()}`;

  const res = await fetch(url, { credentials: "include" });

  return await handleResponse(res)
}

export async function getTopsellers(timeframe?: TimeframeQuerySchema): Promise<> {
  const params = new URLSearchParams();

  if (timeframe) {
    if (timeframe.from) params.set("from", String(timeframe.from));
    if (timeframe.to) params.set("to", String(timeframe.to));
  }

  const url = `${apiBaseUrl}/admin/analytics/topsellers?${params.toString()}`;

  const res = await fetch(url, { credentials: "include" });

return await handleResponse(res);
}
export async function getNewUsers(timeframe?: TimeframeQuerySchema): Promise<> {
  const params = new URLSearchParams();

  if (timeframe) {
    if (timeframe.from) params.set("from", String(timeframe.from));
    if (timeframe.to) params.set("to", String(timeframe.to));
  }

  const url = `${apiBaseUrl}/admin/analytics/new-users?${params.toString()}`;

  const res = await fetch(url, { credentials: "include" });

  return await handleResponse(res);
}

//settings
export async function getAllSettings(): Promise<> {
  const res = await fetch(`${apiBaseUrl}/settings`, {
    credentials: "include",
  });

  const data = await res.json();
  return await handleResponse(res);
}

export async function createSetting(setting: SettingsSchema): Promise<> {
  const res = await fetch(`${apiBaseUrl}/settings`, {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(setting),
  });
return await handleResponse(res);
}

export async function getSettingBySettingId(id: string): Promise<> {
  const res = await fetch(`${apiBaseUrl}/settings/${id}`, {
    credentials: "include",
  });
return await handleResponse(res);
}

export async function deleteAllSettings(): Promise<> {
  const res = await fetch(`${apiBaseUrl}/settings`, {
    credentials: "include",
    method: "DELETE",
  });
return await handleResponse(res);
}

export async function deleteSettingBySettingId(id: string): Promise<> {
  const res = await fetch(`${apiBaseUrl}/settings/${id}`, {
    credentials: "include",
    method: "DELETE",
  });
return await handleResponse(res);
}

export async function updateSettingBySettingId(id: string,content: SettingsSchema): Promise<> {
  const res = await fetch(`${apiBaseUrl}/settings/${id}`, {
    credentials: "include",
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(content),
  });

return await handleResponse(res);
}

//products
//check how to do with images
export async function createProduct(content: ProductSchema): Promise<> {
  const res = await fetch(`${apiBaseUrl}/products`, {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
return await handleResponse(res);
}

export async function deleteProductByProductId(id: string): Promise<> {
  const res = await fetch(`${apiBaseUrl}/products/${id}`, {
    credentials: "include",
    method: "DELETE",
  });
return await handleResponse(res);
}

export async function updateProductByProductId(id: string,content: UpdateProductSchema): Promise<> {
  const res = await fetch(`${apiBaseUrl}/products/${id}`, {
    credentials: "include",
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
return await handleResponse(res);
}

//orders
//order search queries type could be wrong since user also uses it
export async function getOrders(
  timeframe?: TimeframeQuerySchema,
  queryParam?: OrdersQuerySchema
): Promise<> {
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

  const url = `${apiBaseUrl}/orders?${params.toString()}`;

  const res = await fetch(url, { credentials: "include" });

return await handleResponse(res);
}

//categories
export async function createCategory(category: string): Promise<> {
  const res = await fetch(`${apiBaseUrl}/categories`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category }),
  });
return await handleResponse(res);
}

export async function deleteCategoryByCategoryId(id: string): Promise<> {
  const res = await fetch(`${apiBaseUrl}/categories/${id}`, {
    credentials: "include",
    method: "DELETE",
  });
return await handleResponse(res);
}
