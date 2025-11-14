//some need verifycaptcha infos
//csrf token on x-csrf-token header
//expired accesstoken than call refresh-token route
//access token in authz bearer header
//need auto refresh so doesnt get logged out

"use server"
import { LoginSchema, SignupSchema } from "@monorepo/shared";
import { handleResponse } from "./utils";
import { AuthResponse } from "@/types/types";
import { apiBaseUrl } from "@/config/constants";




export async function login(credentials: LoginSchema, captchaToken: string): Promise<AuthResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token":captchaToken
    },
    body: JSON.stringify(credentials),
  });
  return await handleResponse(res);
}

export async function signup(credentials: SignupSchema, captchaToken: string): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cf-turnstile-token": captchaToken,
    },
    body: JSON.stringify(credentials),
  });
  return await handleResponse(res);
}

export async function logout(): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  await handleResponse(res);
}

export async function verifyAfterEmailLink(token: string): Promise<AuthResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({token}),
  });
  return await handleResponse(res);
}

export async function sendNewVerificationLink(email: string): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/auth/new-verify-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  await handleResponse(res);
}

export async function changePasswordAfterLogin(passwords: {
  oldPassword: string;
  newPassword: string;
}): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/auth/change-password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(passwords),
    credentials: "include",
  });
  await handleResponse(res);
}

export async function forgotPasswordSendEmail(email: string): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  await handleResponse(res);
}

export async function getNewRefreshToken(): Promise<AuthResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  });
  return await handleResponse(res);
}

// optional if you handle redirects manually
export async function googleLoginCallback(): Promise<AuthResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/oauth/google/callback`, {
    credentials: "include",
  });
  return await handleResponse(res);
}

export async function facebookLoginCallback(): Promise<AuthResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/oauth/facebook/callback`, {
    credentials: "include",
  });
  return await handleResponse(res);
}
