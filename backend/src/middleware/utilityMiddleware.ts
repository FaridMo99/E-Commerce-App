import RedisStore from "rate-limit-redis";
import redis from "../services/redis.js";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { NODE_ENV } from "../config/env.js";
import type { NextFunction, Request, Response } from "express";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";

export const authRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
  }),
  windowMs: NODE_ENV === "dev" ? 1 : 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    console.log(`${getTimestamp()} Rate limit reached for: " + req.ip + " on " + req.url`);
    res
      .status(429)
      .json({
        message:
          "Too many requests, please wait 15 minutes since your last request",
      });
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip!),
});


export function loggerMiddleware(req:Request, res:Response, next:NextFunction) {
    console.log(chalk.blue(
      `${getTimestamp()} Incoming request: ${req.method} ${req.originalUrl} from IP ${req.ip} to ${req.url}`
    ));
    next();
}