import type { UserRole } from "../generated/prisma/enums.js";

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
