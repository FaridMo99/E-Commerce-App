"use server";
import { getApiUrl } from "@/config/constants";
import { handleResponse } from "../utils";
import { AccessToken } from "@/types/types";
import { getAllHeaders, getCsrfHeader } from "../../serverHelpers";

//returns sessionid from stripe to then route to stripe checkout
export async function makeOrder(
  accessToken: AccessToken,
): Promise<{ redirectUrl: string }> {
  const [additionalHeaders, csrfHeader] = await Promise.all([
    getAllHeaders(),
    getCsrfHeader(),
  ]);

  const res = await fetch(`${getApiUrl()}/orders`, {
    credentials: "include",
    method: "POST",
    headers: {
      ...csrfHeader,
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders,
    },
  });
  return await handleResponse(res);
}

export async function cancelOrder(
  orderId: string,
  accessToken: AccessToken,
): Promise<void> {
  const [additionalHeaders, csrfHeader] = await Promise.all([
    getAllHeaders(),
    getCsrfHeader(),
  ]);

  const res = await fetch(`${getApiUrl()}/orders/${orderId}/cancel`, {
    credentials: "include",
    method: "POST",
    headers: {
      ...csrfHeader,
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders,
    },
  });
  return await handleResponse(res);
}
