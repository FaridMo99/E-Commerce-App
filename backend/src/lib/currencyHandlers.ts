import { productSchema } from "@monorepo/shared";
import {
  EXCHANGE_RATE_REDIS_KEY,
  DEFAULT_NICE_PRICE,
  ONE_DAY_IN_SECONDS,
} from "../config/constants.js";
import { OPEN_EXCHANGE_RATE_APP_KEY } from "../config/env.js";
import { CurrencyISO } from "../generated/prisma/enums.js";
import redis from "../services/redis.js";
import type {
  NicePrice,
  OpenExchangeRateApiReturn,
} from "../types/types.js";
import chalk from "chalk";
import { calcAvgRating, getTimestamp } from "./utils.js";
import type { ProductWithSelectedFields } from "../config/prismaHelpers.js";

//cronjob refreshes every 6 hours, exchange rate stored for 5 days, in case of exchange rate api issues
export async function getExchangeRates(): Promise<OpenExchangeRateApiReturn> {
  try {
  const redisReturn = await redis.get(EXCHANGE_RATE_REDIS_KEY);
  if (redisReturn) return JSON.parse(redisReturn);

  const res = await fetch(
    `https://openexchangerates.org/api/latest.json?app_id=${OPEN_EXCHANGE_RATE_APP_KEY}`,
  );
  if (!res.ok) {
    console.log(chalk.red(`${getTimestamp()} Exchange rate API failed (${res.status})}`));
    throw new Error(`Exchange rate API failed (${res.status})}`);
  }
  const data: OpenExchangeRateApiReturn = await res.json();

  await redis.set(EXCHANGE_RATE_REDIS_KEY, JSON.stringify(data), {
    EX: ONE_DAY_IN_SECONDS
  });
  return data;
  } catch (err) {
    console.log(chalk.red(`${getTimestamp()} Exchange Rate Api failure: ` + err))
    throw err
  }

}

export function roundPriceUpInCents(
  amount: number,
  ending: NicePrice = DEFAULT_NICE_PRICE,
): number {
  //round up
  const cents = Math.ceil(amount);
  //last two digits to "nice" ending
  const rounded = Math.floor(cents / 100) * 100 + ending;
  // If the rounded value is less than the original cents, add 100 to ensure we round up
  const result = rounded < cents ? rounded + 100 : rounded;
  return result;
}

type MultiCurrencyPrice = {
  [key in CurrencyISO]: {
    priceInCents: number;
    salePriceInCents?: number;
  };
};

export async function exchangeAllPricesInCents(
  baseCurrency: CurrencyISO,
  priceInCents: number,
  salePriceInCents?: number
): Promise<MultiCurrencyPrice> {
  const exchangeRates = await getExchangeRates();

  const currencies: CurrencyISO[] = ["USD", "GBP", "EUR"];

  const result: MultiCurrencyPrice = {} as MultiCurrencyPrice;

  for (const targetCurrency of currencies) {
    let conversionRate = 1;

    if (baseCurrency !== targetCurrency) {
      // Convert baseCurrency -> USD
      const baseToUSD =
        baseCurrency === "USD" ? 1 : 1 / exchangeRates.rates[baseCurrency]!;
      // Convert USD -> targetCurrency
      const usdToTarget = exchangeRates.rates[targetCurrency]!;

      conversionRate = baseToUSD * usdToTarget;
    }

    // Convert main price
    const convertedPrice = priceInCents * conversionRate;
    let ending = priceInCents % 100;
    if (!productSchema.shape.price.safeParse(ending).success) {
      ending = DEFAULT_NICE_PRICE;
    }
    const finalPrice = roundPriceUpInCents(convertedPrice, ending as NicePrice);

    // Convert sale price if provided
    let finalSalePrice: number | undefined;
    if (salePriceInCents != null) {
      const convertedSale = salePriceInCents * conversionRate;
      let saleEnding = salePriceInCents % 100;
      if (!productSchema.shape.price.safeParse(saleEnding).success) {
        saleEnding = DEFAULT_NICE_PRICE;
      }
      finalSalePrice = roundPriceUpInCents(
        convertedSale,
        saleEnding as NicePrice
      );
    }

    result[targetCurrency] = {
      priceInCents: finalPrice,
      salePriceInCents: finalSalePrice,
    };
  }

  return result;
}

export function turnPriceToPriceInCents(price:number):number {
  return price * 100
}

//future reference, when implementing .00 this wont return floats to display
export function formatPriceForClient(cents: number): number {
  const result = Number((cents / 100).toFixed(2));
  return result;
}

export function formatPricesForClient<T extends ProductWithSelectedFields>(
  product: T,
  priceField: Extract<keyof T, string>,
  salePriceField: Extract<keyof T, string>
): void {
  if (typeof product[priceField] === "number") {
    product[priceField] = formatPriceForClient(
      product[priceField] as number
    ) as any;
  }
  if (
    product[salePriceField] != null &&
    typeof product[salePriceField] === "number"
  ) {
    product[salePriceField] = formatPriceForClient(
      product[salePriceField] as number
    ) as any;
  }
}

export function formatPricesForClientAndCalculateAverageRating<T extends ProductWithSelectedFields>(
  product: T,
  priceField: Extract<keyof T, string>,
  salePriceField: Extract<keyof T, string>
 ):void {
  formatPricesForClient(product,priceField,salePriceField);
  calcAvgRating(product);
}