import type { CurrencyISO } from "./src/generated/prisma/enums.ts";
import type {
  JWTRefreshTokenPayload,
  JWTUserPayload,
  OAuthUserPayload,
  Timeframe,
} from "./src/types/types.ts";


declare global {
  namespace Express {
    interface User extends JWTUserPayload {}
    interface Request {
      files?: Express.Multer.File[];
      timeframe?: Timeframe;
      refreshTokenPayload?: JWTRefreshTokenPayload;
      oAuthUser?: OAuthUserPayload;
      currency?: CurrencyISO;
      countryCode?:string
    }
  }
}
