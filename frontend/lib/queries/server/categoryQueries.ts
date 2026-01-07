"use server";
import { API_BASE_URL } from "@/config/constants";
import { handleResponse } from "../utils";
import { ProductCategory } from "@/types/types";
import { getAllHeaders } from "../../serverHelpers";

export async function getAllCategories(): Promise<ProductCategory[]> {
  const additionalHeaders = await getAllHeaders();
  const res = await fetch(`${API_BASE_URL}/categories`, {
    headers: {
      ...additionalHeaders,
    },
  });
  return await handleResponse(res);
}
