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
import { getTimestamp } from "../lib/utils.js";


export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.id!;
  console.log(
    chalk.yellow(
      getTimestamp(),
      `Checking if User with userId:${userId} is Admin...`
    )
  );
  const role = req.user?.role;

  if (!req.user || role !== "ADMIN") {
    console.log(
      chalk.redBright(
        getTimestamp(),
        `Unauthorized attempt to do Admin action, userId: ${userId} on Ressource: ${req.url} method: ${req.method}`
      )
    );
    return res.status(403).json({ message: "User not authorized" });
  }

  console.log(
    chalk.green(getTimestamp(), `User with userId: ${userId} is Admin`)
  );
  next();
}

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(
    chalk.yellow(getTimestamp(), "Checking is user is authenticated")
  );
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    console.log(chalk.red(getTimestamp(), "User is not authenticated"));
    return res.status(401).json({ message: "User not logged in" });
  }

  try {
    const payload = jwt.verify(
      accessToken,
      JWT_ACCESS_TOKEN_SECRET,
    ) as Partial<JWTUserPayload>;

    console.log(chalk.red(getTimestamp(), "User has invalid Access Token"));

    if (!payload.id || !payload.role)
      return res.status(401).json({ message: "Invalid token" });
    req.user = payload as JWTUserPayload;

    console.log(
      chalk.green(getTimestamp(), "User is logged in, UserId: " + payload.id)
    );
    next();
  } catch (err) {
    console.log(chalk.red(getTimestamp(), "Jwt token issue: " + err));
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export async function hasRefreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {

  console.log(chalk.yellow(getTimestamp(),"Checking for Refresh Token..."))
  const token = req.cookies.refreshToken;

  
  if (!token) {
    console.log(
      chalk.red(getTimestamp(), "No Refresh Token available, access denied!")
    );
    return res.status(401).json({ message: "No refresh token" });
  }

  try {

    const verifiedToken = jwt.verify(
      token,
      JWT_REFRESH_TOKEN_SECRET,
    ) as JWTRefreshTokenPayload;
    req.refreshTokenPayload = verifiedToken;

    console.log(
      chalk.green(getTimestamp(), "Refresh Token verification successful!")
    );

    next();
  } catch (err) {
    console.log(
      chalk.red(
        getTimestamp(),
        "Invalid or expired Refresh Token, access denied!"
      )
    );
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
  console.log(
    chalk.yellow(getTimestamp(), "Verifying existence of CSRF Token...")
  );
  const csrfHeader = req.headers["x-csrf-token"];
  const csrfCookie = req.cookies.csrfToken;

  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    console.log(chalk.red(getTimestamp(), `Invalid CSRF Token, access denied`));
    return res.status(401).json({ message: "Invalid CSRF token" });
  }

  console.log(
    chalk.green(getTimestamp(), "CSRF Token exists, mutation allowed")
  );
  next();
}

export async function verifyCaptcha(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(chalk.yellow(getTimestamp(), "Verifying Captcha..."));
  const cfToken = req.headers["x-cf-turnstile-token"];
  const ip = req.ip;

  if (!cfToken || !ip || typeof cfToken !== "string"){
    console.log(
      chalk.red(getTimestamp(), `Captcha verification failed, IP: ${ip}`)
    );
    return res.status(400).json({ message: "Failed Captcha" });
  }

  const verificationResult = await validateTurnstile(cfToken, ip);

  if (!verificationResult.success) {
    console.log(
      chalk.red(getTimestamp(), `Captcha verification failed, IP: ${ip}`)
    );
    return res.status(400).json({
      message: "Captcha verification failed",
      errors: verificationResult["error-codes"],
    });
  }

  console.log(chalk.green(getTimestamp(), "Captcha verification successful"));
  next();
}

export async function attachUserIfExists(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return next();
  }

  try {
    const payload = jwt.verify(
      accessToken,
      JWT_ACCESS_TOKEN_SECRET,
    ) as Partial<JWTUserPayload>;

    if (payload.id && payload.role) {
      req.user = payload as JWTUserPayload;
    }
  } catch (err) {
    console.log("Jwt token issue ignored:", err);
  }

  next();
}
