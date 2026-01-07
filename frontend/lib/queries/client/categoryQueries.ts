import { API_BASE_URL } from "@/config/constants";
import { handleResponse } from "../utils";
import { ProductCategory } from "@/types/types";

export async function getAllCategories(): Promise<ProductCategory[]> {

  const res = await fetch(`${API_BASE_URL}/categories`);
  return await handleResponse(res);
}
