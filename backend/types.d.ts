import type { JWTUserPayload } from "./src/types/types.ts"

declare global {
  namespace Express {
    interface Request {
      user?: JWTUserPayload;
      files?:Express.Multer.File[]
    }
  }
}
