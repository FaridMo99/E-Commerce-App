import { apiBaseUrl } from "@/config/constants";
import { handleResponse } from "../utils";
import { AccessToken } from "@/types/types";
import { getCsrfHeaderClientSide } from "@/lib/helpers";


export async function makeOrder(
  accessToken: AccessToken
): Promise<{ redirectUrl: string }> {
  const res = await fetch(`${apiBaseUrl}/orders`, {
    credentials: "include",
    method: "POST",
    headers: {
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}


export async function cancelOrder(orderId: string, accessToken: AccessToken): Promise<void> {

  const res = await fetch(`${apiBaseUrl}/orders/${orderId}/cancel`, {
    credentials: "include",
    method: "POST",
    headers: {
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}
