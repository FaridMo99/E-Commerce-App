import { apiBaseUrl } from "@/config/constants";
import { handleResponse } from "./utils";
import { getCsrfHeader } from "../helpers";
import { AccessToken } from "@/types/types";


//returns sessionid from stripe to then route to stripe checkout
export async function makeOrder(accessToken:AccessToken): Promise<> {
  const res = await fetch(`${apiBaseUrl}/orders`, {
    credentials: "include",
      method: "POST",
      headers: {
        ...getCsrfHeader(),
        Authorization: `Bearer ${accessToken}`,
    }
  });
  return await handleResponse(res);
}

//will probably be run when on cancel route
export async function cancelOrder(orderId: string,accessToken:AccessToken): Promise<> {
  const res = await fetch(`${apiBaseUrl}/orders/${orderId}/cancel`, {
    credentials: "include",
    method: "POST",
    headers: {
        ...getCsrfHeader(),
        Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}
