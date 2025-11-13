import { apiBaseUrl } from "./productQueries";
import { handleResponse } from "./utils";

export async function getAllCategories(): Promise<> {
  const res = await fetch(`${apiBaseUrl}/categories`);
  return await handleResponse(res);
}
