import { apiBaseUrl } from "@/config/constants";
import { handleResponse } from "./utils";
//returns sessionid from stripe to then route to stripe checkout
export async function makeOrder(): Promise<> {
  const res = await fetch(`${apiBaseUrl}/orders`, {
    credentials: "include",
    method: "POST",
  });
  return await handleResponse(res);
}

//will probably be run when on cancel route
export async function cancelOrder(orderId: string): Promise<> {
  const res = await fetch(`${apiBaseUrl}/orders/${orderId}/cancel`, {
    credentials: "include",
    method: "POST",
  });
  return await handleResponse(res);
}
