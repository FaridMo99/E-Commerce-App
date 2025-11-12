import type {
  JWTRefreshTokenPayload,
  JWTUserPayload,
  OAuthUserPayload,
  Timeframe,
} from "./src/types/types.ts";
declare global {
  namespace Express {
    interface Request {
      user?: JWTUserPayload;
      files?: Express.Multer.File[];
      timeframe?: Timeframe;
      refreshTokenPayload?: JWTRefreshTokenPayload;
      oAuthUser?: OAuthUserPayload;
    }
  }
}
