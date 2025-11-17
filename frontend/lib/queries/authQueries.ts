//expired accesstoken than call refresh-token route
//access token in authz bearer header
//need auto refresh so doesnt get logged out
//maybe add us server to the other fns too

"use server";
import { LoginSchema, SignupSchema } from "@monorepo/shared";
import { handleResponse } from "./utils";
import { AccessToken, AuthResponse, EmailSchema, User } from "@/types/types";
import { apiBaseUrl } from "@/config/constants";
import { getCsrfHeader } from "../helpers";


export async function login(
  credentials: LoginSchema,
  captchaToken: string,
): Promise<AuthResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
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
  captchaToken: string,
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

export async function logout(accessToken: AccessToken): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...getCsrfHeader()
    },
  });
  await handleResponse<void>(res);
}

export async function verifyAfterEmailLink(
  token: string,
): Promise<AuthResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  return await handleResponse<AuthResponse>(res);
}

export async function sendNewVerificationLink(
  email: EmailSchema,
  captchaToken: string,
): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/auth/new-verify-link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token": captchaToken,
    },
    body: JSON.stringify({ email }),
  });
  await handleResponse<void>(res);
}

export async function changePasswordAfterLogin(
  passwords: {
    oldPassword: string;
    newPassword: string;
  },
  accessToken: AccessToken
): Promise<User> {
  const { oldPassword, newPassword } = passwords;
  const res = await fetch(`${apiBaseUrl}/auth/change-password-authenticated`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getCsrfHeader(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
    credentials: "include",
  });
  return await handleResponse(res);
}

export async function forgotPasswordSendEmail(
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
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/change-password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  return await handleResponse<AuthResponse>(res);
}
