import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import type { User } from "../generated/prisma/client.js";
import prisma from "../services/prisma.js";
import type { Response, Request } from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import type { AccessToken, TurnstileResponse } from "../types/types.js";
import {
  CLIENT_ORIGIN,
  CLOUDFLARE_SECRET_KEY,
  JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
  NODE_ENV,
} from "../config/env.js";
dotenv.config();

//issues new refresh and csrf tokens and returns access token
export async function issueTokens(
  user: User,
  res: Response,
): Promise<AccessToken> {
  //access token
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );

  const deviceId = v4();
  //refresh token
  const refreshToken = jwt.sign(
    { userId: user.id, deviceId },
    JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: await bcrypt.hash(refreshToken, 10),
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceId,
    },
  });

  //csrf token (only browser)
  const csrfToken = v4();

  const maxAge = 7 * 24 * 60 * 60 * 1000;
  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    secure: NODE_ENV !== "dev",
    sameSite: "strict",
    maxAge,
  });

  // Send refresh token as httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: NODE_ENV !== "dev",
    sameSite: "strict",
    maxAge,
  });

  return accessToken;
}

//need frontend page to verify
export async function OauthLogin(req: Request, res: Response) {
  const user = req.oAuthUser?.user!;

  const accessToken = await issueTokens(user, res);

  res.redirect(`${CLIENT_ORIGIN}/oauth-success?token=${accessToken}`);
}

export async function validateTurnstile(
  token: string,
  remoteip: string,
): Promise<TurnstileResponse> {
  const params = new URLSearchParams();
  params.append("secret", CLOUDFLARE_SECRET_KEY);
  params.append("response", token);
  params.append("remoteip", remoteip);

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: params },
    );

    return await response.json();
  } catch (error) {
    console.error("Turnstile validation error:", error);
    return { success: false, "error-codes": ["internal-error"] };
  }
}
