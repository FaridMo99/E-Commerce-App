//this whole file shouldnt be send when the user is not a admin
import {
  OrdersQuerySchema,
  ProductSchema,
  TimeframeQuerySchema,
  UpdateProductSchema,
} from "@monorepo/shared";
import { apiBaseUrl } from "@/config/constants";
import { SettingsSchema } from "@monorepo/shared";
import { handleResponse } from "../utils";
import {
  AccessToken,
  AdminNewUser,
  AdminRevenue,
  AdminSetting,
  AdminTopseller,
  CurrencyISO,
  Order,
  ProductCategory,
} from "@/types/types";
import { getCsrfHeaderClientSide } from "@/lib/helpers";
import { BASE_CURRENCY_KEY } from "@monorepo/shared/constants";
import { ClientProductSchema } from "@/schemas/schemas";

//analytics
export async function getRevenue(
  accessToken: AccessToken,
  timeframe?: TimeframeQuerySchema
): Promise<AdminRevenue> {
  const params = new URLSearchParams();

  if (timeframe) {
    if (timeframe.from) params.set("from", String(timeframe.from));
    if (timeframe.to) params.set("to", String(timeframe.to));
  }

  const url = `${apiBaseUrl}/admin/analytics/revenue?${params.toString()}`;


  const res = await fetch(url, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return await handleResponse(res);
}

export async function getTopsellers(
  accessToken: AccessToken,
  timeframe?: TimeframeQuerySchema
): Promise<AdminTopseller[]> {
  const params = new URLSearchParams();

  if (timeframe) {
    if (timeframe.from) params.set("from", String(timeframe.from));
    if (timeframe.to) params.set("to", String(timeframe.to));
  }

  const url = `${apiBaseUrl}/admin/analytics/topsellers?${params.toString()}`;


  const res = await fetch(url, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return await handleResponse(res);
}

export async function getNewUsers(
  accessToken: AccessToken,
  timeframe?: TimeframeQuerySchema
): Promise<AdminNewUser> {
  const params = new URLSearchParams();

  if (timeframe) {
    if (timeframe.from) params.set("from", String(timeframe.from));
    if (timeframe.to) params.set("to", String(timeframe.to));
  }

  const url = `${apiBaseUrl}/admin/analytics/new-users?${params.toString()}`;


  const res = await fetch(url, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return await handleResponse(res);
}

//settings
export async function getAllSettings(
  accessToken: AccessToken
): Promise<AdminSetting[]> {
  const res = await fetch(`${apiBaseUrl}/settings`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return await handleResponse(res);
}

export async function createSetting(
  setting: SettingsSchema,
  accessToken: AccessToken
): Promise<AdminSetting> {

  const res = await fetch(`${apiBaseUrl}/settings`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(setting),
  });
    
  return await handleResponse(res);
}

export async function getSettingBySettingId(
  id: string,
  accessToken: AccessToken
): Promise<AdminSetting> {
  const res = await fetch(`${apiBaseUrl}/settings/${id}`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}

type Replace<T, K extends keyof T, U> = Omit<T, K> & U;


export async function getBaseCurrency(accessToken: AccessToken): Promise<
  Replace<
    AdminSetting,
    "key" | "value",
    {
      key: typeof BASE_CURRENCY_KEY;
      value: CurrencyISO;
    }
  >
> {
  const res = await fetch(`${apiBaseUrl}/settings/${BASE_CURRENCY_KEY}`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}

export async function deleteAllSettings(
  accessToken: AccessToken
): Promise<void> {

  const res = await fetch(`${apiBaseUrl}/settings`, {
    credentials: "include",
    method: "DELETE",
    headers: {
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}

export async function deleteSettingBySettingId(
  id: string,
  accessToken: AccessToken
): Promise<void> {

  const res = await fetch(`${apiBaseUrl}/settings/${id}`, {
    credentials: "include",
    method: "DELETE",
    headers: {
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}

export async function updateSettingBySettingId(
  id: string,
  content: SettingsSchema,
  accessToken: AccessToken
): Promise<AdminSetting> {

  const res = await fetch(`${apiBaseUrl}/settings/${id}`, {
    credentials: "include",
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(content),
  });

  return await handleResponse(res);
}

//products
export async function createProduct(
  product: ClientProductSchema,
  accessToken: AccessToken
): Promise<void> {
  const formData = new FormData();

  formData.append("name", product.name);
  formData.append("description", product.description);
    formData.append("category", product.category);
  formData.append("price", product.price.toString());
  if (product.sale_price !== undefined)
  formData.append("sale_price", product.sale_price.toString());
  formData.append("stock_quantity", product.stock_quantity.toString());
  formData.append("is_public", String(product.is_public));

  product.images.forEach((file) => {
    formData.append("images", file);
  });

  const res = await fetch(`${apiBaseUrl}/products`, {
    credentials: "include",
    method: "POST",
    headers: {
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  await handleResponse(res);
}

export async function deleteProductByProductId(
  id: string,
  accessToken: AccessToken
): Promise<void> {

  const res = await fetch(`${apiBaseUrl}/products/${id}`, {
    credentials: "include",
    method: "DELETE",
    headers: {
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}

export async function updateProductByProductId(
  id: string,
  content: UpdateProductSchema,
  accessToken: AccessToken
): Promise<void> {

  const res = await fetch(`${apiBaseUrl}/products/${id}`, {
    credentials: "include",
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(content),
  });
  await handleResponse(res);
}

//orders
export async function getOrders(
  accessToken: AccessToken,
  timeframe?: TimeframeQuerySchema,
  queryParam?: OrdersQuerySchema
): Promise<Order[]> {

  const params = new URLSearchParams();

  if (queryParam) {
    if (queryParam.page) params.set("page", String(queryParam.page));
    if (queryParam.limit) params.set("limit", String(queryParam.limit));
    if (queryParam.sort) params.set("sortBy", queryParam.sort);
    if (queryParam.order) params.set("sortOrder", String(queryParam.order));
  }

  if (timeframe) {
    if (timeframe.from) params.set("from", String(timeframe.from));
    if (timeframe.to) params.set("to", String(timeframe.to));
  }

  const url = `${apiBaseUrl}/orders?${params.toString()}`;

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return await handleResponse(res);
}

//categories
export async function createCategory(
  category: string,
  accessToken: AccessToken
): Promise<ProductCategory> {

  const res = await fetch(`${apiBaseUrl}/categories`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ category }),
  });
  return await handleResponse(res);
}

export async function deleteCategoryByCategoryId(
  id: string,
  accessToken: AccessToken
): Promise<void> {

  const res = await fetch(`${apiBaseUrl}/categories/${id}`, {
    credentials: "include",
    method: "DELETE",
    headers: {
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}
