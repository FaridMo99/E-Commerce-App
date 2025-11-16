import chalk from "chalk";
import { createClient } from "redis";
import { REDIS_URL } from "../config/env.js";
import { getTimestamp } from "../lib/utils.js";

const redis = createClient({ url: REDIS_URL });

(async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.log(chalk.red(getTimestamp(), "Redis connection error: " + err));
  }
})();

redis.on("error", (err) => {
  console.error(chalk.red(getTimestamp(), "Redis Error: ", err));
});

redis.on("connect", () => {
  console.log(chalk.yellow(getTimestamp(), "Redis connecting..."));
});

redis.on("ready", () => {
  console.log(chalk.green(getTimestamp(), "Redis ready"));
});

redis.on("end", () => {
  console.log(chalk.blue(getTimestamp(), "Redis disconnected"));
});

export default redis;
