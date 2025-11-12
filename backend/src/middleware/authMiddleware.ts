import { loginSchema, signupSchema, updateUserSchema } from "@monorepo/shared";
import chalk from "chalk";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JWTRefreshTokenPayload, JWTUserPayload } from "../types/types.js";
import {
  JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
} from "../config/env.js";
import { validateTurnstile } from "../lib/auth.js";

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const validated = loginSchema.safeParse(req.body);

  if (!validated.success)
    return res.status(400).json({ message: validated.error.message });

  return next();
}

export function validateSignup(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const validated = signupSchema.safeParse(req.body);

  if (!validated.success)
    return res.status(400).json({ message: validated.error.message });

  req.body = validated.data;
  return next();
}

export function validateUpdateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const validated = updateUserSchema.safeParse(req.body);

  if (!validated.success)
    return res.status(400).json({ message: validated.error.message });

  req.body = validated.data;
  return next();
}

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  const role = req.user?.role;
  if (!req.user || role !== "ADMIN")
    return res.status(403).json({ message: "User not authorized" });
  next();
}

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken)
    return res.status(401).json({ message: "User not logged in" });

  try {
    const payload = jwt.verify(
      accessToken,
      JWT_ACCESS_TOKEN_SECRET,
    ) as Partial<JWTUserPayload>;

    if (!payload.id || !payload.role)
      return res.status(401).json({ message: "Invalid token" });
    req.user = payload as JWTUserPayload;

    next();
  } catch (err) {
    console.log(chalk.red("Jwt token issue: " + err));
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export async function hasRefreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const verifiedToken = jwt.verify(
      token,
      JWT_REFRESH_TOKEN_SECRET,
    ) as JWTRefreshTokenPayload;
    req.refreshTokenPayload = verifiedToken;
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
}

export async function hasCsrfToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const csrfHeader = req.headers["x-csrf-token"];
  const csrfCookie = req.cookies.csrfToken;

  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    return res.status(401).json({ message: "Invalid CSRF token" });
  }

  next();
}

export async function verifyCaptcha(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const cfToken = req.body.cfToken;
  const ip = req.ip;
  if (!cfToken || !ip || typeof cfToken !== "string")
    return res.status(400).json({ message: "Failed Captcha" });

  const verificationResult = await validateTurnstile(cfToken, ip);

  if (!verificationResult.success) {
    return res.status(400).json({
      message: "Captcha verification failed",
      errors: verificationResult["error-codes"],
    });
  }

  next();
}
