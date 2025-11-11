import dotenv from "dotenv"
dotenv.config()

//node
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN!;
export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT;

//email
export const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS!;

//stripe
export const STRIPE_API_KEY = process.env.STRIPE_SECRET_KEY!;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ""

//cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!
export const CLOUDINARY_URL = process.env.CLOUDINARY_URL!

//mailjet
export const MJ_APIKEY_PUBLIC = process.env.MJ_APIKEY_PUBLIC!;
export const MJ_APIKEY_PRIVATE = process.env.MJ_APIKEY_PRIVATE!;

//db + cache
export const REDIS_URL = process.env.REDIS_URL!
export const DB_URL = process.env.DATABASE_URL!;

//jwt
export const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
export const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!
export const JWT_EMAIL_TOKEN_SECRET = process.env.JWT_EMAIL_SECRET!;

//oauth google
export const OAUTH_GOOGLE_CLIENT_ID = process.env.OAUTH_GOOGLE_CLIENT_ID!
export const OAUTH_GOOGLE_CLIENT_SECRET = process.env.OAUTH_GOOGLE_CLIENT_SECRET!

//oauth facebook
export const OAUTH_FACEBOOK_CLIENT_ID = process.env.OAUTH_FACEBOOK_CLIENT_ID ?? ""
export const OAUTH_FACEBOOK_CLIENT_SECRET = process.env.OAUTH_FACEBOOK_CLIENT_SECRET ?? ""

//cloudflare captcha
export const CLOUDFLARE_SECRET_KEY = process.env.CLOUDFLARE_SECRET_KEY!;

export const CLOUDFLARE_DUMMY_KEY_PASS = process.env.CLOUDFLARE_DEVELOPMENT_SECRET_KEY_PASS!;
export const CLOUDFLARE_DUMMY_KEY_FAIL = process.env.CLOUDFLARE_DEVELOPMENT_SECRET_KEY_FAIL!;

export const OPEN_EXCHANGE_RATE_APP_KEY = process.env.OPEN_EXCHANGE_RATE_APP_KEY!