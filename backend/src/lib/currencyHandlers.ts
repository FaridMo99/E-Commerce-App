import { productSchema } from "@monorepo/shared";
import {
  EXCHANGE_RATE_REDIS_KEY,
  TWELVE_HOURS_IN_SECONDS,
  DEFAULT_NICE_PRICE,
} from "../config/constants.js";
import { OPEN_EXCHANGE_RATE_APP_KEY } from "../config/env.js";
import { CurrencyISO } from "../generated/prisma/enums.js";
import redis from "../services/redis.js";
import type {
  ExchangePrice,
  NicePrice,
  OpenExchangeRateApiReturn,
} from "../types/types.js";

export async function getExchangeRates(): Promise<OpenExchangeRateApiReturn> {
  const redisReturn = await redis.get(EXCHANGE_RATE_REDIS_KEY);
  if (redisReturn) return JSON.parse(redisReturn);

  const res = await fetch(
    `https://openexchangerates.org/api/latest.json?app_id=${OPEN_EXCHANGE_RATE_APP_KEY}`,
  );
  if (!res.ok) {
    console.log(`Exchange rate API failed (${res.status})}`);
    throw new Error(`Exchange rate API failed (${res.status})}`);
  }
  const data: OpenExchangeRateApiReturn = await res.json();

  await redis.set(EXCHANGE_RATE_REDIS_KEY, JSON.stringify(data), {
    EX: TWELVE_HOURS_IN_SECONDS,
  });
  return data;
}

function roundPriceUpInCents(
  amount: number,
  ending: NicePrice = DEFAULT_NICE_PRICE,
): number {
  console.log("amount" + amount);
  //round up
  const cents = Math.ceil(amount);
  console.log(cents);
  //last two digits to "nice" ending
  const rounded = Math.floor(cents / 100) * 100 + ending;
  console.log(rounded);
  // If the rounded value is less than the original cents, add 100 to ensure we round up
  const result = rounded < cents ? rounded + 100 : rounded;
  console.log(result);
  return result;
}

export async function exchangeToCurrencyInCents(
  baseCurrency: CurrencyISO,
  priceInCents: number,
  wantedCurrency: CurrencyISO,
): Promise<ExchangePrice> {
  const exchangeRates = await getExchangeRates();
  console.log(priceInCents);
  if (baseCurrency === wantedCurrency) {
    return { exchangedPriceInCents: priceInCents, currency: wantedCurrency };
  }
  // Convert base currency -> USD if needed
  const baseToUSD =
    baseCurrency === "USD" ? 1 : 1 / exchangeRates.rates[baseCurrency]!;
  // Convert USD -> wanted currency
  const usdToTarget = exchangeRates.rates[wantedCurrency]!;

  // Full conversion rate: baseCurrency -> wantedCurrency
  const conversionRate = baseToUSD * usdToTarget;
  // Convert price in cents
  const convertedCents = priceInCents * conversionRate;

  // Round up to a nice ending
  let ending = priceInCents % 100;
  if (!productSchema.shape.price.safeParse(ending).success) {
    ending = DEFAULT_NICE_PRICE;
  }
  const exchangedPriceInCents = roundPriceUpInCents(
    convertedCents,
    ending as NicePrice,
  );
  return { exchangedPriceInCents, currency: wantedCurrency };
}

//future reference, when implementing .00 this wont return floats to display
export function formatPriceForClient(cents: number): number {
  console.log("cents " + cents);
  const result = Number((cents / 100).toFixed(2));
  console.log("result " + result);
  return result;
}

//also transform the product u send in cartitem/cart for user
