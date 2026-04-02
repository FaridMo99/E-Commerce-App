import dotenv from "dotenv";
import type { CurrencyISO } from "../generated/prisma/enums.js";
dotenv.config();

//node
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN!;
export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT;
export const BACKEND_URL = process.env.BACKEND_URL;

//email
export const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS!;

//stripe
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
export const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY!;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

//mailjet
export const MJ_APIKEY_PUBLIC = process.env.MJ_APIKEY_PUBLIC!;
export const MJ_APIKEY_PRIVATE = process.env.MJ_APIKEY_PRIVATE!;

//db + cache
export const REDIS_URL = process.env.REDIS_URL!;
export const DB_URL = process.env.DATABASE_URL!;

//jwt
export const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
export const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
export const JWT_EMAIL_TOKEN_SECRET = process.env.JWT_EMAIL_SECRET!;

//oauth google
export const OAUTH_GOOGLE_CLIENT_ID = process.env.OAUTH_GOOGLE_CLIENT_ID!;
export const OAUTH_GOOGLE_CLIENT_SECRET =
  process.env.OAUTH_GOOGLE_CLIENT_SECRET!;

//cloudflare captcha
export const CLOUDFLARE_SECRET_KEY = process.env.CLOUDFLARE_SECRET_KEY!;

export const CLOUDFLARE_DUMMY_KEY_PASS =
  process.env.CLOUDFLARE_DEVELOPMENT_SECRET_KEY_PASS!;
export const CLOUDFLARE_DUMMY_KEY_FAIL =
  process.env.CLOUDFLARE_DEVELOPMENT_SECRET_KEY_FAIL!;

export const OPEN_EXCHANGE_RATE_APP_KEY =
  process.env.OPEN_EXCHANGE_RATE_APP_KEY!;

export const DEV_EMAIL_FALLBACK_IF_NO_ADMIN =
  process.env.DEV_EMAIL_FALLBACK_IF_NO_ADMIN!;

//Ip locate
export const IP_LOCATE_API_KEY = process.env.IP_LOCATE_API_KEY;

//admin settings
export const ADMIN_NAME = process.env.ADMIN_NAME!;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
export const ADMIN_COUNTRYCODE = process.env.ADMIN_COUNTRYCODE!;
export const ADMIN_CURRENCY = process.env.ADMIN_CURRENCY as CurrencyISO;
export const BASE_CURRENCY = process.env.BASE_CURRENCY as CurrencyISO;

//seed DB conitional
export const SEED_PRODUCTS = process.env.SEED_PRODUCTS as "true" | "false";

//cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;
export const CLOUDINARY_URL = process.env.CLOUDINARY_URL!;

// AWS S3 
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;
export const AWS_REGION = process.env.AWS_REGION!;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;