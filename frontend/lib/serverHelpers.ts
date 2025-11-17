"use server";
import { cookies, headers } from "next/headers";

export async function getCsrfHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();

  const csrfToken = cookieStore.get("csrfToken")?.value;

  if (!csrfToken) {
    console.error("CSRF token not found in request cookies");
    return {};
  }

  // Return the header object
  return { "x-csrf-token": csrfToken };
}

export async function getAllHeaders(): Promise<Record<string, string>> {
  const clientHeaders = await headers();

  const headersObject: Record<string, string> =
    Object.fromEntries(clientHeaders);

  return headersObject;
}