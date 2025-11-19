"use server";
import { apiBaseUrl } from "@/config/constants";
import { handleResponse } from "../utils";
import { ProductCategory } from "@/types/types";
import { getAllHeaders } from "../../serverHelpers";

export async function getAllCategories(): Promise<ProductCategory[]> {
  const additionalHeaders = await getAllHeaders();
  const res = await fetch(`${apiBaseUrl}/categories`, {
    headers: {
      ...additionalHeaders,
    },
  });
  return await handleResponse(res);
}
