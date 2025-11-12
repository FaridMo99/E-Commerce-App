//some need verifycaptcha infos
//csrf token on x-csrf-token header
//expired accesstoken than call refresh-token route
//access token in authz bearer header
//need auto refresh so doesnt get logged out

import { LoginSchema, SignupSchema } from "@monorepo/shared";
import { apiBaseUrl } from "./productQueries";
import { handleResponse } from "./utils";

//button click redirects to this route
const googleLoginPath = `${apiBaseUrl}/auth/oauth/google`;
const facebookLoginPath = `${apiBaseUrl}/auth/oauth/facebook`;

//placeholder types
type User = { name: string };
type AuthResponse = { accessToken: string; user: User };


export async function login(credentials: LoginSchema): Promise<AuthResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return handleResponse(res);
}

export async function signup(credentials: SignupSchema): Promise<AuthResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return handleResponse(res);
}

export async function logout(): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  await handleResponse(res);
}

export async function verifyAfterEmaiLink(token: string): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  await handleResponse(res);
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
  return handleResponse(res);
}


// optional if you handle redirects manually
export async function googleLoginCallback(): Promise<AuthResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/oauth/google/callback`, {
    credentials: "include",
  });
  return handleResponse(res);
}

export async function facebookLoginCallback(): Promise<AuthResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/oauth/facebook/callback`, {
    credentials: "include",
  });
  return handleResponse(res);
}
