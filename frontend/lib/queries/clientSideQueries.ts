import { apiBaseUrl } from "@/config/constants";
import { AccessToken, AuthResponse, User } from "@/types/types";
import { EmailSchema, LoginSchema } from "@monorepo/shared";
import { handleResponse } from "./utils";
import { getCsrfHeaderClientSide } from "../helpers";


//expired accesstoken than call refresh-token route
//need auto refresh so doesnt get logged out

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

export async  function clientForgotPasswordSendEmail(
  email: EmailSchema,
  captchaToken: string,
): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token": captchaToken,
    },
    body: JSON.stringify(email),
  });
  await handleResponse(res)
}

export async function clientVerifyAfterEmailLink(
  token: string,
): Promise<AuthResponse> {

  const res = await fetch(`${apiBaseUrl}/auth/verify`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
  return await handleResponse<AuthResponse>(res);
}

export async function clientSendNewVerificationLink(
  email: EmailSchema,
  captchaToken: string,
): Promise<void> {

  const res = await fetch(`${apiBaseUrl}/auth/new-verify-link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token": captchaToken,
    },
    body: JSON.stringify(email),
  });
  await handleResponse<void>(res);
}

export async function clientChangePasswordAfterLogin(
  passwords: {
    oldPassword: string;
    newPassword: string;
  },
  accessToken: AccessToken
): Promise<User> {
  const res = await fetch(`${apiBaseUrl}/auth/change-password-authenticated`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(passwords),
    credentials: "include",
  });
  return await handleResponse(res);
}

export async function clientGetNewRefreshToken(): Promise<AuthResponse> {

  const res = await fetch(`${apiBaseUrl}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  });
  return await handleResponse<AuthResponse>(res);
}

export async function clientChangePasswordUnauthenticated(
  token: string,
  password: string,
): Promise<AuthResponse> {

  const res = await fetch(`${apiBaseUrl}/auth/change-password`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password }),
  });
  return await handleResponse<AuthResponse>(res);
}