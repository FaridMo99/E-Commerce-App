import type { CurrencyISO } from "../generated/prisma/enums.js";

//redis store exchange rates, key name
export const EXCHANGE_RATE_REDIS_KEY = "exchangeRates";
export const ONE_DAY_IN_SECONDS = 43200 * 2;
export const TWELVE_HOURS_IN_SECONDS = 43200;
export const DEFAULT_NICE_PRICE = 99;
export const BASE_CURRENCY_KEY = "baseCurrency";
export const TIME_DIFFERENCE_FOR_NEW_PRODUCTS_IN_DAYS = 14;

export const NEW_PRODUCTS_REDIS_KEY = "newProducts";
export const SALE_PRODUCTS_REDIS_KEY = "saleProducts";
export const TRENDING_PRODUCTS_REDIS_KEY = "trendingProducts";
export const CATEGORIES_REDIS_KEY = "categories";

export const EURO_COUNTRIES = [
  "AT",
  "BE",
  "CY",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PT",
  "SK",
  "SI",
  "ES",
];

export const DOLLAR_COUNTRIES = ["US", "CA", "AU", "NZ", "SG", "HK"];

export const GBP_COUNTRIES = ["GB"];

export const FALLBACK_COUNTRY_ISO_CODE = "US";
export const FALLBACK_COUNTRY_CURRENCY_ISO = "USD";

export const SUPPORTED_CURRENCIES:CurrencyISO[] = ["USD","GBP","EUR"]