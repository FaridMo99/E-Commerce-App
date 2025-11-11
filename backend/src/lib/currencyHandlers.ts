import { OPEN_EXCHANGE_RATE_APP_KEY } from "../config/env.js";
import { CurrencyISO } from "../generated/prisma/enums.js";
import redis from "../services/redis.js";
import type { ExchangePrice, OpenExchangeRateApiReturn } from "../types/types.js";

const roundingPriceEnding = 99
export const exchangeRateRedisKey = "exchangeRates";

//only returns exchange rates related to usd
export async function getExchangeRates(): Promise<OpenExchangeRateApiReturn> {
    const redisReturn = await redis.get(exchangeRateRedisKey)
    if (redisReturn) return JSON.parse(redisReturn);
    
    const res = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${OPEN_EXCHANGE_RATE_APP_KEY}`);
    if (!res.ok) {
        console.log(`Exchange rate API failed (${res.status})}`);
        throw new Error(`Exchange rate API failed (${res.status})}`);
    }
    const data: OpenExchangeRateApiReturn = await res.json();
    const twelveHours = 43200;

    await redis.set(exchangeRateRedisKey, JSON.stringify(data), { EX: twelveHours });
    return data
}

function roundPriceUp(amount: number, ending: 0 | 95 | 99 = 99):number {
    
  const cents = Math.ceil(amount * 100);
  const dollars = Math.floor(cents / 100);
    
  return dollars * 100 + ending;
}

export async function exchangeToCurrency(
  baseCurrency: CurrencyISO,
  priceInCents: number,
  wantedCurrency: CurrencyISO
): Promise<ExchangePrice> {
  const exchangeRates = await getExchangeRates();

  //1299 → 12.99
  const priceInMajorUnits = priceInCents / 100;

  // Base → USD
  const priceInUSD =
    baseCurrency === "USD"
      ? priceInMajorUnits
      : priceInMajorUnits / exchangeRates.rates[baseCurrency]!;

  // USD → target currency
  const targetInMajorUnits = priceInUSD * exchangeRates.rates[wantedCurrency]!;

  const rounded = roundPriceUp(targetInMajorUnits, roundingPriceEnding);

  return {
    currency: wantedCurrency,
    exchangedPrice: rounded, 
  };
}


export function formatPriceForClient(cents: number):number {
  return Number((cents / 100).toFixed(2));
}

//also transform the product u send in cartitem/cart for user