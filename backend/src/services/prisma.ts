import chalk from "chalk";
import { PrismaClient } from "../generated/prisma/client.js";
import { getTimestamp } from "../lib/utils.js";

const prisma = new PrismaClient();

(async () => {
  console.log(
    chalk.yellow(getTimestamp(), "Prisma connecting to the Database..."),
  );

  try {
    await prisma.$connect();

    console.log(
      chalk.green(getTimestamp(), `Prisma connected to Database successfully`),
    );
  } catch (error) {
    console.log(chalk.red(getTimestamp(), "Prisma connection failed!"));

    if (error instanceof Error) {
      console.log(chalk.red(getTimestamp(), "Reason:", error.message));
    }
    process.exit(1);
  }
})();

export default prisma;
