import { apiBaseUrl } from "@/config/constants";
import { handleResponse } from "./utils";
import { ProductCategory } from "@/types/types";

export async function getAllCategories(): Promise<ProductCategory[]> {
  const res = await fetch(`${apiBaseUrl}/categories`);
  return await handleResponse(res);
}
