import type { User } from "../generated/prisma/client.js";
import type { CurrencyISO, UserRole } from "../generated/prisma/enums.js";

export type JWTUserPayload = {
  id: string;
  role: UserRole;
};

export type JWTRefreshTokenPayload = {
  userId: string;
  deviceId: string;
};

export type Timeframe = {
  from?: Date | undefined;
  to: Date;
};

export type AccessToken = string;

export type UrlType = "verify-success" | "change-password";

export type OAuthUserPayload = {
  user: User;
};

export type TurnstileResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  ["error-codes"]?: string[];
};

type seconds = number;
type ExchangeRates = Record<CurrencyISO | string, number>;

// format of exchange rates example:AED: 3.672538;
export type OpenExchangeRateApiReturn = {
  disclaimer: string;
  license: string;
  timestamp: seconds;
  base: "USD";
  rates: ExchangeRates;
};

export type ExchangePrice = {
  currency: CurrencyISO;
  exchangedPriceInCents: number;
};

export type NicePrice = 0 | 95 | 99;
