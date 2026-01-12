import cron from "node-cron";
import { getExchangeRates } from "../lib/currencyHandlers.js";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";
import prisma from "./prisma.js";

//this only in memory so on restart doesnt run on time, in real production app would be better to have on os level not app logic

//every 6 hours
cron.schedule("0 */6 * * *", async () => {
  //refresh exchange rate
  try {
    console.log(chalk.yellow(getTimestamp(), "Refreshing exchange rates..."));
    const rates = await getExchangeRates();
    console.log(chalk.green(getTimestamp(), "Rates refreshed:", rates));
  } catch (err) {
    console.log(
      chalk.red(getTimestamp(), "Failed to refresh exchange rates:", err),
    );
  }
});

//releasing stock from users that didnt finish order and left stripe checkout through none stripe supported ways
cron.schedule("* * * * *", async () => {
  console.log(chalk.yellow(getTimestamp(), "Cleaning expired Orders..."));

  const expiredOrders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      expires_at: { lt: new Date() },
    },
  });

  if (expiredOrders.length === 0) {
    console.log(chalk.green(getTimestamp(), "Cleaned Orders Successfully"));
    return;
  }

  await Promise.all(
    expiredOrders.map(async (order) => {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { status: "EXPIRED" },
          });

          const orderItems = await tx.order_Item.findMany({
            where: { order_id: order.id },
          });

          for (const item of orderItems) {
            await tx.product.update({
              where: { id: item.product_id },
              data: { stock_quantity: { increment: item.quantity } },
            });
          }
        });
        console.log(chalk.blue(`Restocked Order: ${order.id}`));
      } catch (err) {
        console.error(chalk.red(`Failed to release order ${order.id}:`), err);
      }
    }),
  );

  console.log(chalk.green(getTimestamp(), "Cleaned Orders Successfully"));
});
