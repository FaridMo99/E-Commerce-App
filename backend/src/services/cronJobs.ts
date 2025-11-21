import cron from "node-cron";
import { getExchangeRates } from "../lib/currencyHandlers.js";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";

//this only in memory so on restart doesnt run on time, in real production app would be better to have on os level not app logic

//every 6 hours
cron.schedule("0 */6 * * *", async () => {
  //refresh exchange rate
  console.log(chalk.yellow(getTimestamp(), "Refreshing exchange rates..."));
  const rates = await getExchangeRates();
  console.log(chalk.green(getTimestamp(), " Rates refreshed:", rates));
});