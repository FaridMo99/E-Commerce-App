import chalk from "chalk";
import { createClient } from "redis"
import dotenv from "dotenv"
dotenv.config()

const redis = createClient({ url: process.env.REDIS_URL! });

  (async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.log(chalk.red("Redis connection error: " + err));
  }
})();

redis.on("error", (err) => {
  console.error("Redis Error:", err);
});

redis.on("connect", () => {
  console.log(chalk.yellow("Redis connecting..."));
});

redis.on("ready", () => {
  console.log(chalk.green("Redis ready"));
});

redis.on("end", () => {
  console.log(chalk.blue("Redis disconnected"));
});

export default redis