import chalk from "chalk";
import { server } from "../../app.js";
import prisma from "../services/prisma.js";
import redis from "../services/redis.js";
import { getTimestamp } from "./utils.js";
import { notifyAdmin } from "../services/email.js";
import { NODE_ENV } from "../config/env.js";


export async function disconnectAllServices(reason: string, error?: Error) {
  console.log(chalk.blue(`${getTimestamp()} Disconnecting all Services, Reason:${reason}, Error Message: ${error?.message}`));

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (redis.isOpen) {
      console.log(chalk.yellow(`${getTimestamp()} Disconnecting Redis...`));
      await redis.quit();
    }

    console.log(chalk.yellow(`${getTimestamp()} Disconnecting DB...`));
    await prisma.$disconnect();

    console.log(chalk.green(`${getTimestamp()} Disconnects successful. Exiting...`));
    if (NODE_ENV !== "dev") {
       notifyAdmin(`Application is down, reason: ${reason}:: ERROR: ${error?.message}`)
    }
    process.exit(error ? 1 : 0);
  } catch (disconnectErr) {
    console.log(chalk.red(getTimestamp(), "Error during disconnect:", disconnectErr));
        if (NODE_ENV !== "dev") {
          notifyAdmin(
            `Application is down, reason: ${reason}:: ERROR: ${disconnectErr}`
          );
        }
    process.exit(1);
  }
}
