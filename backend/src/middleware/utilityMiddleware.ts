import RedisStore from "rate-limit-redis";
import redis from "../services/redis.js";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { NODE_ENV } from "../config/env.js";
import type { NextFunction, Request, Response } from "express";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";
import {
  EURO_COUNTRIES,
  FALLBACK_COUNTRY_CURRENCY_ISO,
  FALLBACK_COUNTRY_ISO_CODE,
  GBP_COUNTRIES,
} from "../config/constants.js";
import { lookup } from "../../app.js";
import type { CurrencyISO } from "../generated/prisma/enums.js";
import type { CountryResponse } from "maxmind";

export const authRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
  }),
  windowMs: NODE_ENV === "dev" ? 1 : 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    console.log(
      `${getTimestamp()} Rate limit reached for: " + req.ip + " on " + req.url`
    );
    res.status(429).json({
      message:
        "Too many requests, please wait 15 minutes since your last request",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip!),
});

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(
    chalk.blue(
      `${getTimestamp()} Incoming request: ${req.method} ${req.originalUrl} from IP ${req.ip} to ${req.url}`
    )
  );
  next();
}

//needs to run after isAuthenticated middleware since it needs req.user
export async function geoCurrencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    //authed user check
    console.log(
      chalk.yellow(`${getTimestamp()} Geolocation Middleware running...`)
    );
    if (req.user?.countryCode && req.user?.currency) {
      console.log(
        chalk.green(
          `${getTimestamp()} Using authenticated user settings: ${req.user.countryCode}, ${req.user.currency}`
        )
      );
      req.countryCode = req.user.countryCode;
      req.currency = req.user.currency;
      return next();
    }

    //set ip if not authed
    const ip = (req.headers["x-forwarded-for"]?.toString().split(",")[0] ??
      req.ip)!;
    console.log(chalk.green(`${getTimestamp()} Client IP found: ${ip}`));

    //redis lookup
    const cached = await redis.hGetAll(`geo:${ip}`);
    if (cached && cached.country && cached.currency) {
      console.log(
        chalk.green(
          `${getTimestamp()} Cache hit for IP ${ip}: ${cached.country}, ${cached.currency}`
        )
      );
      req.countryCode = cached.country;
      req.currency = cached.currency as CurrencyISO;
      return next();
    }
    console.log(chalk.yellow(`${getTimestamp()} Cache miss for IP ${ip}`));

    //maxmind lookup
    const geo = lookup.get(ip) as unknown as CountryResponse;
    const country = geo?.country?.iso_code ?? FALLBACK_COUNTRY_ISO_CODE;
    console.log(chalk.magenta(`${getTimestamp()} maxmind lookup: ${country}`));

    //set currency
    let currency: CurrencyISO = FALLBACK_COUNTRY_CURRENCY_ISO;
    if (GBP_COUNTRIES.includes(country)) currency = "GBP";
    else if (EURO_COUNTRIES.includes(country)) currency = "EUR";
    console.log(chalk.cyan(`${getTimestamp()} Currency set: ${currency}`));

    //store in redis
    await redis.hSet(`geo:${ip}`, { country, currency });
    await redis.expire(`geo:${ip}`, 60 * 60 * 2);

    console.log(
      chalk.green(`${getTimestamp()} Stored geo info in Redis for IP ${ip}`)
    );

    //attach to req
    req.countryCode = country;
    req.currency = currency;

    next();
  } catch (err) {
    console.error(chalk.red(`${getTimestamp()} Error: ${err}`));
    // fallback
    req.countryCode = "US";
    req.currency = "USD";
    next();
  }
}



export function transformProductFormData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const body = { ...req.body };

  body.price = body.price ? parseFloat(body.price) : undefined;
  body.sale_price = body.sale_price ? parseFloat(body.sale_price) : undefined;
  body.stock_quantity = body.stock_quantity
    ? parseInt(body.stock_quantity)
    : undefined;
  body.is_public = body.is_public === "true";

  req.body = body;
  next(); 
}
