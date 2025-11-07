import type { JWTUserPayload, Timeframe } from "./src/types/types.ts"

declare global {
  namespace Express {
    interface Request {
      user?: JWTUserPayload;
      files?: Express.Multer.File[];
      timeframe?:Timeframe
    }
  }
}
