import { apiBaseUrl } from "@/config/constants";
import { AuthResponse } from "@/types/types";
import { LoginSchema } from "@monorepo/shared";
import { handleResponse } from "./utils";

export async function clientLogin(
  credentials: LoginSchema,
  captchaToken: string,
): Promise<AuthResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    credentials:"include",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token": captchaToken,
    },
    body: JSON.stringify(credentials),
  });
  return await handleResponse<AuthResponse>(res);
}