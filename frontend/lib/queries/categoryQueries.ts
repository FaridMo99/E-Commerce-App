import { apiBaseUrl } from "@/config/constants";
import { handleResponse } from "./utils";

export type Category = { name: string; id: string };

export async function getAllCategories(): Promise<Category[]> {
  const res = await fetch(`${apiBaseUrl}/categories`);
  return await handleResponse(res);
}
