import { AccessToken, User } from "@/types/types";
import { headers } from "next/headers";

export async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}


export async function getProtectedHeaders():Promise<{accessToken:AccessToken | undefined,user:User }> {
      const headerList = await headers();

      const userJson = headerList.get("x-internal-user");
  const accessToken = headerList.get("x-internal-token") || undefined;

      const user = userJson ? JSON.parse(userJson) : undefined;
  
  return {
    accessToken,
    user
  }
}