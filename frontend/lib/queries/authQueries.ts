//expired accesstoken than call refresh-token route
//need auto refresh so doesnt get logged out

"use server";
import { LoginSchema, SignupSchema } from "@monorepo/shared";
import { handleResponse } from "./utils";
import { AccessToken, AuthResponse, EmailSchema, User } from "@/types/types";
import { apiBaseUrl } from "@/config/constants";
import { getCsrfHeader, getAllHeaders } from "../serverHelpers";


export async function login(
  credentials: LoginSchema,
  captchaToken: string,
): Promise<AuthResponse> {
  const additionalHeaders = await getAllHeaders()
  const res = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    credentials:"include",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token": captchaToken,
      ...additionalHeaders
    },
    body: JSON.stringify(credentials),
  });
  return await handleResponse<AuthResponse>(res);
}

export async function signup(
  credentials: SignupSchema,
  captchaToken: string,
): Promise<void> {
    const additionalHeaders = await getAllHeaders();

  const res = await fetch(`${apiBaseUrl}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token": captchaToken,
      ...additionalHeaders,
    },
    body: JSON.stringify(credentials),
  });
  return await handleResponse<void>(res);
}

export async function logout(accessToken: AccessToken): Promise<void> {
  const [additionalHeaders, csrfHeader] = await Promise.all([
    getAllHeaders(),
    getCsrfHeader(),
  ]);


  const res = await fetch(`${apiBaseUrl}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...csrfHeader,
      ...additionalHeaders
    },
  });
  await handleResponse<void>(res);
}

export async function verifyAfterEmailLink(
  token: string,
): Promise<AuthResponse> {
    const additionalHeaders = await getAllHeaders();

  const res = await fetch(`${apiBaseUrl}/auth/verify`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...additionalHeaders,
    },
    body: JSON.stringify({ token }),
  });
  return await handleResponse<AuthResponse>(res);
}

export async function sendNewVerificationLink(
  email: EmailSchema,
  captchaToken: string,
): Promise<void> {
    const additionalHeaders = await getAllHeaders();

  const res = await fetch(`${apiBaseUrl}/auth/new-verify-link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token": captchaToken,
      ...additionalHeaders,
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
  const [additionalHeaders, csrfHeader] = await Promise.all([
    getAllHeaders(),
    getCsrfHeader(),
  ]);


  const { oldPassword, newPassword } = passwords;
  const res = await fetch(`${apiBaseUrl}/auth/change-password-authenticated`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeader,
      Authorization: `Bearer ${accessToken}`,
      ...additionalHeaders,
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
    const additionalHeaders = await getAllHeaders();

  const res = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token": captchaToken,
      ...additionalHeaders,
    },
    body: JSON.stringify(email),
  });
  await handleResponse<void>(res);
}

export async function getNewRefreshToken(): Promise<AuthResponse> {
      const additionalHeaders = await getAllHeaders();

  const res = await fetch(`${apiBaseUrl}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
    headers: {
      ...additionalHeaders,
    },
  });

  return await handleResponse<AuthResponse>(res);
}

export async function changePasswordUnauthenticated(
  token: string,
  password: string,
): Promise<AuthResponse> {
    const additionalHeaders = await getAllHeaders();

  const res = await fetch(`${apiBaseUrl}/auth/change-password`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...additionalHeaders,
    },
    body: JSON.stringify({ token, password }),
  });
  return await handleResponse<AuthResponse>(res);
}
