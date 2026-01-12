import { CurrencyISO, Prisma } from "../src/generated/prisma/client.js";
import prisma from "../src/services/prisma.js";
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import { BASE_CURRENCY_KEY } from "../src/config/constants.js";

const ADMIN_NAME = process.env.ADMIN_NAME!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const ADMIN_COUNTRYCODE = process.env.ADMIN_COUNTRYCODE!;
const ADMIN_CURRENCY = process.env.ADMIN_CURRENCY as CurrencyISO;
const BASE_CURRENCY = process.env.BASE_CURRENCY as CurrencyISO;

const baseAdmin: Prisma.UserCreateInput = {
  role: "ADMIN",
  name: ADMIN_NAME,
  email: ADMIN_EMAIL,
  verified: true,
  createdBy: "SELF",
  password: await bcrypt.hash(ADMIN_PASSWORD, 10),
  countryCode: ADMIN_COUNTRYCODE,
  currency: ADMIN_CURRENCY,
};

const baseCurrency: Prisma.SettingsCreateInput = {
  key: BASE_CURRENCY_KEY,
  value: BASE_CURRENCY,
};

async function seedDb() {
  await Promise.all([
    prisma.user.create({
      data: baseAdmin,
    }),
    prisma.settings.create({
      data: baseCurrency,
    }),
  ]);
}

async function checkIfSeeded() {
  const adminExists = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
    },
  });

  if (!adminExists) {
    await seedDb();
  }
}

await checkIfSeeded();
