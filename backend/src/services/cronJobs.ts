import cron from "node-cron"
import {  getExchangeRates } from "../lib/currencyHandlers.js";

//this only in memory so on restart doesnt run on time, in real production app would be better to have on os level not app logic

//every 12 hours
cron.schedule("0 */12 * * *", async () => {
  //refresh exchange rate
  console.log("Refreshing exchange rates...");
  const rates = await getExchangeRates();
  console.log("Rates refreshed:", rates);
});