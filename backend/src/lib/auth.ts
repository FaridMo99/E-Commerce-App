import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import type { User } from "../generated/prisma/client.js";
import prisma from "../services/prisma.js";
import type { Response, Request } from "express";
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import type { AccessToken } from "../types/types.js";
dotenv.config()


//issues new refresh and csrf tokens and returns access token
export async function issueTokens(user:User,res:Response):Promise<AccessToken> {
  //access token
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: "15m",
    }
  );

  const deviceId = v4()
  //refresh token
  const refreshToken = jwt.sign({ userId: user.id, deviceId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: await bcrypt.hash(refreshToken,10),
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceId
    },
  });

  //csrf token (only browser)
  const csrfToken = v4();

  const maxAge = 7 * 24 * 60 * 60 * 1000
  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV !== "dev",
    sameSite: "strict",
    maxAge
  });

  // Send refresh token as httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "dev",
    sameSite: "strict",
    maxAge
  });
    
    return accessToken
}

export async function OauthLogin(req:Request, res: Response) {
  const user = req.oAuthUser?.user!;

  const accessToken = await issueTokens(user, res);

  return res.status(200).json({ accessToken, user });
}