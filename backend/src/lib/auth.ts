import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import type { User } from "../generated/prisma/client.js";
import prisma from "../services/prisma.js";
import type { Response, Request } from "express";
import bcrypt from "bcrypt";
import type { AccessToken, TurnstileResponse } from "../types/types.js";
import {
  CLIENT_ORIGIN,
  CLOUDFLARE_SECRET_KEY,
  JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
  NODE_ENV,
} from "../config/env.js";
import { getTimestamp } from "./utils.js";
import chalk from "chalk";

//issues new refresh and csrf tokens and returns access token
export async function issueTokens(
  user: User,
  res: Response,
  deviceId?:string,
): Promise<AccessToken> {
  try {
    const finalDeviceId = deviceId ?? v4()

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      JWT_ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, deviceId:finalDeviceId },
      JWT_REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );

    await prisma.refreshToken.create({
      data: {
        token: await bcrypt.hash(refreshToken, 10),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceId:finalDeviceId,
      },
    });

    console.log(
      chalk.green(
        `${getTimestamp()} Refresh token stored for user ${user.id}, device ${deviceId}`
      )
    );

    const csrfToken = v4();
    const maxAge = 7 * 24 * 60 * 60 * 1000;

   const isProd = NODE_ENV !== "dev";

   res.cookie("csrfToken", csrfToken, {
     httpOnly: false,
     secure: isProd,
     sameSite: "lax",
     maxAge,
   });

   res.cookie("refreshToken", refreshToken, {
     httpOnly: true,
     secure: isProd,
     sameSite: "lax",
     maxAge,
   });

    console.log(
      chalk.green(
        `${getTimestamp()} Access & CSRF tokens set for user ${user.id}`
      )
    );
    return accessToken;
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to issue tokens for user ${user.id}:`,
        err
      )
    );
    throw err;
  }
}

//need frontend page to verify
export async function OauthLogin(req: Request, res: Response) {
  try {
    const user = req.oAuthUser?.user!;

    const accessToken = await issueTokens(user, res);
    
    console.log(
      chalk.green(
        `${getTimestamp()} OAuth login successful for user ${user.id}`
      )
    );
    return res.redirect(
      `${CLIENT_ORIGIN}/oauth-success?token=${accessToken}`
    );
  } catch (err) {
    console.log(chalk.red(`${getTimestamp()} OAuth login failed`, err));
    throw err;
  }
}

//this isnt auth, this is bot protect, move this somewhere else
export async function validateTurnstile(
  token: string,
  remoteip: string
): Promise<TurnstileResponse> {
  const params = new URLSearchParams();
  params.append("secret", CLOUDFLARE_SECRET_KEY);
  params.append("response", token);
  params.append("remoteip", remoteip);

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: params }
    );

    const result = await response.json();
    if (result.success) {
      console.log(
        chalk.green(`${getTimestamp()} Turnstile verification succeeded`)
      );
    } else {
      console.log(
        chalk.yellow(
          `${getTimestamp()} Turnstile verification failed`,
          result["error-codes"]
        )
      );
    }
    return result;
  } catch (error) {
    console.log(
      chalk.red(`${getTimestamp()} Turnstile validation error:`, error)
    );
    return { success: false, "error-codes": ["internal-error"] };
  }
}
