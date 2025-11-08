import type { UserRole } from "../generated/prisma/enums.js";

export type JWTUserPayload = {
  id: string;
  role: UserRole;
};

export type Timeframe = {
  from?: Date | undefined;
  to: Date
};

export type UrlType = "verify-success" | "change-password"
