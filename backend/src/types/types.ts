import type { User } from "../generated/prisma/client.js";
import type { UserRole } from "../generated/prisma/enums.js";
import type { Request } from "express";

export type JWTUserPayload = {
  id: string;
  role: UserRole;
};

export type JWTRefreshTokenPayload = {
  userId: string,
  deviceId:string
}

export type Timeframe = {
  from?: Date | undefined;
  to: Date
};

export type AccessToken = string;


export type UrlType = "verify-success" | "change-password"

export type OAuthUserPayload = {user: User;}