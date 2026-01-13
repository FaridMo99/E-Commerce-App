import { getApiUrl } from "@/config/constants";
import { handleResponse } from "../utils";
import { ProductCategory } from "@/types/types";

export async function getAllCategories(): Promise<ProductCategory[]> {
  const res = await fetch(`${getApiUrl()}/categories`);
  return await handleResponse(res);
}
