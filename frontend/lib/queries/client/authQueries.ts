import { apiBaseUrl } from "@/config/constants";
import {
  AccessToken,
  AuthResponse,
  ChangePasswordAuthenticatedSchema,
  ChangePasswordSchema,
  User,
} from "@/types/types";
import { EmailSchema, LoginSchema, SignupSchema } from "@monorepo/shared";
import { handleResponse } from "../utils";
import { getCsrfHeaderClientSide } from "../../helpers";

export async function login(
  credentials: LoginSchema,
  captchaToken: string
): Promise<AuthResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token": captchaToken,
    },
    body: JSON.stringify(credentials),
  });
  return await handleResponse<AuthResponse>(res);
}

export async function signup(
  credentials: SignupSchema,
  captchaToken: string
): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token": captchaToken,
    },
    body: JSON.stringify(credentials),
  });
  return await handleResponse<void>(res);
}

export async function forgotPasswordSendEmail(
  email: EmailSchema,
  captchaToken: string
): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token": captchaToken,
    },
    body: JSON.stringify(email),
  });
  await handleResponse(res);
}

export async function verifyAfterEmailLink(
  token: string
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

export async function sendNewVerificationLink(
  email: EmailSchema,
  captchaToken: string
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

export async function getNewRefreshToken(): Promise<AuthResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  });
  return await handleResponse<AuthResponse>(res);
}

export async function changePasswordUnauthenticated(
  token: string,
  password: string
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

export async function logout(accessToken: AccessToken): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...getCsrfHeaderClientSide(),
    },
  });
  await handleResponse<void>(res);
  cookieStore.delete("refreshToken");
  cookieStore.delete("csrfToken");
}

export async function changePasswordAuthenticated(
  passwords: ChangePasswordAuthenticatedSchema,
  accessToken: AccessToken
): Promise<User> {
  const { oldPassword, password } = passwords;
  const res = await fetch(`${apiBaseUrl}/auth/change-password-authenticated`, {
    credentials: "include",
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ password, oldPassword }),
  });
  return await handleResponse(res);
}

export async function setPassword(
  passwords: ChangePasswordSchema,
  accessToken: AccessToken
): Promise<User> {
  const { password } = passwords;
  const res = await fetch(`${apiBaseUrl}/auth/set-password`, {
    credentials: "include",
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ password }),
  });
  return await handleResponse(res);
}