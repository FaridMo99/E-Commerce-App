"use server";
import type {
  EmailSchema,
  LoginSchema,
  SignupSchema,
} from "@monorepo/shared";
import { handleResponse } from "../utils";
import { AccessToken, AuthResponse } from "@/types/types";
import { ENV, getApiUrl } from "@/config/constants";
import { getCsrfHeader, getAllHeaders } from "../../serverHelpers";
import { cookies } from "next/headers";
import { stripContentLengthHeader } from "../../helpers";

async function syncCookies(res: Response) {
  const setCookieHeaders = res.headers.getSetCookie();
  if (setCookieHeaders.length === 0) return;

  const cookieStore = await cookies();

  setCookieHeaders.forEach((cookieString) => {
    const parts = cookieString.split(";").map((p) => p.trim());
    const [nameValue, ...attributes] = parts;
    const [name, ...valueParts] = nameValue.split("=");
    const value = valueParts.join("=");

    const isProd = ENV === "production"

    cookieStore.set(name, value, {
      httpOnly:
        name === "refreshToken" ||
        attributes.some((a) => a.toLowerCase() === "httponly"),
      secure: true,
      sameSite: isProd ? "none" : "lax",
      domain: ".shoppi.lat",
      path: "/",
    });
  });
}

export async function login(
  credentials: LoginSchema,
  captchaToken: string
): Promise<AuthResponse> {

  const additionalHeaders = await getAllHeaders();
  const res = await fetch(`${getApiUrl()}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token": captchaToken,
      ...additionalHeaders,
    },
    body: JSON.stringify(credentials),
  });

  await syncCookies(res);

  return await handleResponse<AuthResponse>(res);
}

export async function signup(
  credentials: SignupSchema,
  captchaToken: string,
): Promise<void> {
  const additionalHeaders = await getAllHeaders();
  const safeHeader = stripContentLengthHeader(additionalHeaders);

  const res = await fetch(`${getApiUrl()}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token": captchaToken,
      ...safeHeader,
    },
    body: JSON.stringify(credentials),
  });
  return await handleResponse<void>(res);
}

export async function logout(accessToken: AccessToken): Promise<void> {
  const [additionalHeaders, csrfHeader, cookieStore] = await Promise.all([
    getAllHeaders(),
    getCsrfHeader(),
    cookies(),
  ]);

  const res = await fetch(`${getApiUrl()}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...csrfHeader,
      ...additionalHeaders,
    },
  });
  await handleResponse<void>(res);
  cookieStore.delete("refreshToken");
  cookieStore.delete("csrfToken");
}

export async function verifyAfterEmailLink(
  token: string,
): Promise<AuthResponse> {
  const additionalHeaders = await getAllHeaders();
  const safeHeader = stripContentLengthHeader(additionalHeaders);

  const res = await fetch(`${getApiUrl()}/auth/verify`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...safeHeader,
    },
    body: JSON.stringify({ token }),
  });

  await syncCookies(res);

  return await handleResponse<AuthResponse>(res);
}

export async function sendNewVerificationLink(
  email: EmailSchema,
  captchaToken: string,
): Promise<void> {
  const additionalHeaders = await getAllHeaders();
  const safeHeader = stripContentLengthHeader(additionalHeaders);

  const res = await fetch(`${getApiUrl()}/auth/new-verify-link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token": captchaToken,
      ...safeHeader,
    },
    body: JSON.stringify(email),
  });
  await handleResponse<void>(res);
}

export async function forgotPasswordSendEmail(
  email: EmailSchema,
  captchaToken: string,
): Promise<void> {
  const additionalHeaders = await getAllHeaders();
  const safeHeader = stripContentLengthHeader(additionalHeaders);
  console.log(email);
  const res = await fetch(`${getApiUrl()}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token": captchaToken,
      ...safeHeader,
    },
    body: JSON.stringify(email),
  });
  await handleResponse<void>(res);
}

export async function getNewRefreshToken(): Promise<AuthResponse> {
  const additionalHeaders = await getAllHeaders();

  const res = await fetch(`${getApiUrl()}/auth/refresh-token`, {
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
  const safeHeader = stripContentLengthHeader(additionalHeaders);

  const res = await fetch(`${getApiUrl()}/auth/change-password`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...safeHeader,
    },
    body: JSON.stringify({ token, password }),
  });

  await syncCookies(res);
  
  return await handleResponse<AuthResponse>(res);
}
