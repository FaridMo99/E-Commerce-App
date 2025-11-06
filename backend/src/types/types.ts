import type { UserRole } from "../generated/prisma/enums.js";

export type JWTUserPayload = {
  id: string;
  role: UserRole;
};
