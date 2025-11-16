import type { Request, Response, NextFunction } from "express";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";

const euroCountries = ["AT","BE","CY","EE","FI","FR","DE","GR","IE","IT","LV","LT","LU","MT","NL","PT","SK","SI","ES"];

const dollarCountries = ["US", "CA", "AU", "NZ", "SG", "HK"];

// Determine currency by country code
export function getCurrencyFromCountry(countryCode: string): string {
  if (countryCode === "GB") return "GBP";
  if (euroCountries.includes(countryCode)) return "EUR";
  if (dollarCountries.includes(countryCode)) return "USD";
  return "USD";
}

// Middleware to set currency cookie based on user IP
export async function setCurrencyCookie(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const ip = req.ip;
    console.log(
      chalk.yellow(`${getTimestamp()} Determining currency for IP: ${ip}`)
    );

    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
    const geoData = await geoRes.json();

    const country = geoData.country || "US";
    const currency = getCurrencyFromCountry(country) || "USD";

    res.cookie("currency", currency, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365 * 1000,
      path: "/",
    });

    console.log(
      chalk.green(`${getTimestamp()} Currency set to ${currency} for IP: ${ip}`)
    );
    res.json({ currency });
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to determine currency, defaulting to USD`
      ),
      err
    );
    res.status(500).json({ currency: "USD" });
  }
}
