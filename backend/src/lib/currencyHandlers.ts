import {
  EXCHANGE_RATE_REDIS_KEY,
  DEFAULT_NICE_PRICE,
  ONE_DAY_IN_SECONDS,
  BASE_CURRENCY_KEY,
  TWELVE_HOURS_IN_SECONDS,
} from "../config/constants.js";
import { OPEN_EXCHANGE_RATE_APP_KEY } from "../config/env.js";
import { CurrencyISO } from "../generated/prisma/enums.js";
import redis from "../services/redis.js";
import type { NicePrice, OpenExchangeRateApiReturn } from "../types/types.js";
import chalk from "chalk";
import { calcAvgRating, getTimestamp } from "./utils.js";
import type { ProductWithSelectedFields } from "../config/prismaHelpers.js";
import prisma from "../services/prisma.js";

//cronjob refreshes every 6 hours, exchange rate stored for 5 days, in case of exchange rate api issues
export async function getExchangeRates(): Promise<OpenExchangeRateApiReturn> {
  try {
    const redisReturn = await redis.get(EXCHANGE_RATE_REDIS_KEY);
    if (redisReturn) return JSON.parse(redisReturn);

    const res = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${OPEN_EXCHANGE_RATE_APP_KEY}`
    );
    if (!res.ok) {
      console.log(
        chalk.red(`${getTimestamp()} Exchange rate API failed (${res.status})}`)
      );
      throw new Error(`Exchange rate API failed (${res.status})}`);
    }
    const data: OpenExchangeRateApiReturn = await res.json();

    await redis.set(EXCHANGE_RATE_REDIS_KEY, JSON.stringify(data), {
      EX: ONE_DAY_IN_SECONDS,
    });
    return data;
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Exchange Rate Api failure: ` + err)
    );
    throw err;
  }
}

export function roundPriceUpInCents(
  amount: number,
  ending: NicePrice = DEFAULT_NICE_PRICE
): number {
  //round up
  const cents = Math.ceil(amount);
  //last two digits to "nice" ending
  const rounded = Math.floor(cents / 100) * 100 + ending;
  // If the rounded value is less than the original cents, add 100 to ensure we round up
  const result = rounded < cents ? rounded + 100 : rounded;
  return result;
}

export function turnPriceToPriceInCents(price: number): number {
  return price * 100;
}

//future reference, when implementing .00 this wont return floats to display
export function formatPriceForClient(cents: number): number {
  const result = Number((cents / 100).toFixed(2));
  return result;
}

//mutates on spot
export function formatPricesForClientAndCalculateAverageRating(
  product: ProductWithSelectedFields
): void {
  product.price = formatPriceForClient(product.price);

  if (product.sale_price) {
    product.sale_price = formatPriceForClient(product.sale_price);
  }
  calcAvgRating(product);
}

//mutates on spot
export async function transformAndFormatProductPrice(
  product: ProductWithSelectedFields,
  baseCurrency: CurrencyISO,
  wantedCurrency: CurrencyISO
): Promise<void> {
  try {
    // 1. If currency is the same → nothing to exchange
    if (baseCurrency !== wantedCurrency) {
      const { rates } = await getExchangeRates();

      const baseRate = rates[baseCurrency];
      const wantedRate = rates[wantedCurrency];

      if (!baseRate || !wantedRate) {
        throw new Error(
          `Missing currency rate for ${baseCurrency} or ${wantedCurrency}`
        );
      }

      // Exchange factor: USD → baseCurrency → wantedCurrency
      // openexchangerates always returns: 1 USD = rates[X]
      const usdToBase = 1 / baseRate;
      const usdToWanted = wantedRate;

      const exchangeFactor = usdToBase * usdToWanted;

      // ---- Convert product.price (in cents) ----
      product.price = Math.round(product.price * exchangeFactor);

      // ---- Convert sale_price if exists ----
      if (product.sale_price) {
        product.sale_price = Math.round(product.sale_price * exchangeFactor);
      }

      // set currency
      product.currency = wantedCurrency;
    }

    // 2. Apply nice price rounding
    product.price = roundPriceUpInCents(product.price);

    if (product.sale_price) {
      product.sale_price = roundPriceUpInCents(product.sale_price);
    }

    // 3. Format prices to .00 display
    product.price = formatPriceForClient(product.price);

    if (product.sale_price) {
      product.sale_price = formatPriceForClient(product.sale_price);
    }

    // 4. calculate average rating
    calcAvgRating(product);
  } catch (err) {
    console.log(
      chalk.red(getTimestamp(), "transformAndFormatProductPrice error:", err)
    );
  }
}

//for meta
export async function convertAndFormatPriceInCents(
  amountInCents: number,
  baseCurrency: CurrencyISO,
  wantedCurrency: CurrencyISO
): Promise<number> {
  if (!amountInCents) return 0;

  // 1. Exchange if needed
  if (baseCurrency !== wantedCurrency) {
    const { rates } = await getExchangeRates();

    const baseRate = rates[baseCurrency];
    const wantedRate = rates[wantedCurrency];

    if (!baseRate || !wantedRate) {
      throw new Error(
        `Missing currency rate for ${baseCurrency} or ${wantedCurrency}`
      );
    }

    // USD → base → wanted
    const usdToBase = 1 / baseRate;
    const usdToWanted = wantedRate;
    const exchangeFactor = usdToBase * usdToWanted;

    amountInCents = Math.round(amountInCents * exchangeFactor);
  }

  // 2. Apply your nice price rounding
  amountInCents = roundPriceUpInCents(amountInCents);

  // 3. Format for client
  return formatPriceForClient(amountInCents);
}

export async function getBaseCurrency():Promise<CurrencyISO> {
  try {
    const cached = await redis.get(BASE_CURRENCY_KEY) as CurrencyISO
  if (cached) {
    return cached
  }

  const currency = await prisma.settings.findFirst({
    where: {
      key:BASE_CURRENCY_KEY
    }
  })
    
    if (currency) {
      redis.setEx(BASE_CURRENCY_KEY, TWELVE_HOURS_IN_SECONDS, currency.value)
    }

    return currency?.value as CurrencyISO

  } catch (err) {
    console.log(chalk.red("Base currency fetch error:", err))
    throw err
  }

}