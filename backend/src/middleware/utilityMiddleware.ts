import RedisStore from "rate-limit-redis";
import redis from "../services/redis.js";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";


export const authRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip!),
});
