import type { Request, Response, NextFunction } from "express";

const euroCountries = [
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

const dollarCountries = ["US", "CA", "AU", "NZ", "SG", "HK"];

//check if its better to set in db or how exactly to do, maybe i already have this logic and its unnecessary

export function getCurrencyFromCountry(countryCode: string): string {
  if (countryCode === "GB") return "GBP";
  if (euroCountries.includes(countryCode)) return "EUR";
  if (dollarCountries.includes(countryCode)) return "USD";
  return "USD";
}

export async function setCurrencyCookie(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ip = req.ip;
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
    const geoData = await geoRes.json();

    const country = geoData.country || "US";
    const currency = getCurrencyFromCountry(country) || "USD";

    res.cookie("currency", currency, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365 * 1000,
      path: "/",
    });

    res.json({ currency });
  } catch (err) {
    console.error(err);
    res.status(500).json({ currency: "USD" });
  }
}
