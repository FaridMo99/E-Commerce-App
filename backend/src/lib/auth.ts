import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import type { User } from "../generated/prisma/client.js";
import prisma from "../services/prisma.js";
import type { Response } from "express";
import bcrypt from "bcrypt"
import dotenv from "dotenv"
dotenv.config()

export async function issueTokens(user:User,res:Response):Promise<{accessToken:string, csrfToken:string}> {
  //access token
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: "15m",
    }
  );

  //refresh token
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: await bcrypt.hash(refreshToken,10),
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  //csrf token (only browser)
  const csrfToken = v4();

  // Send refresh token as httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "dev",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
    
    return {accessToken, csrfToken}
}