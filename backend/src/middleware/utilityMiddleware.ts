import RedisStore from "rate-limit-redis";
import redis from "../services/redis.js";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { NODE_ENV } from "../config/env.js";

export const authRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
  }),
  windowMs: NODE_ENV === "dev" ? 1 : 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    console.log("Rate limit reached for: " + req.ip + " on " + req.url);
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
