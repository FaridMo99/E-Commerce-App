import "../config/env.js";
import "../config/constants.js";
import "../services/prisma.js";
import type { CurrencyISO, Prisma } from "../generated/prisma/client.js";
import prisma from "../services/prisma.js";
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import { BASE_CURRENCY_KEY } from "../config/constants.js";
import {
  ADMIN_COUNTRYCODE,
  ADMIN_CURRENCY,
  ADMIN_EMAIL,
  ADMIN_NAME,
  ADMIN_PASSWORD,
  BASE_CURRENCY,
  SEED_PRODUCTS,
} from "../config/env.js";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";

export const mockCategoryId = "MockClothingId";

export const mockCategory: Prisma.CategoryCreateInput = {
  name: "Clothes",
  id: mockCategoryId,
};

export const mockProducts: Prisma.ProductCreateManyInput[] = [
  {
    name: "Classic Cotton T-Shirt",
    description:
      "A comfortable, 100% cotton t-shirt perfect for everyday wear.",
    price: 2599,
    sale_price: 2099,
    currency: "USD" as CurrencyISO,
    stock_quantity: 100,
    is_public: true,
    imageUrls: ["https://picsum.photos/seed/tshirt/400/600"],
    category_id: mockCategoryId,
  },
  {
    name: "Reflex Running Shoes",
    description:
      "Lightweight running shoes with advanced cushioning technology.",
    price: 1299,
    sale_price: null,
    currency: "EUR" as CurrencyISO,
    stock_quantity: 45,
    is_public: true,
    imageUrls: ["https://picsum.photos/seed/shoes/400/600"],
    category_id: mockCategoryId,
  },
  {
    name: "Midnight Denim Jeans",
    description: "Slim-fit dark wash denim jeans with a slight stretch.",
    price: 5599,
    sale_price: 4599,
    currency: "GBP",
    stock_quantity: 0,
    is_public: true,
    imageUrls: ["https://picsum.photos/seed/jeans/400/600"],
    category_id: mockCategoryId,
  },
  {
    name: "Minimalist Leather Wallet",
    description:
      "Genuine leather wallet with RFID protection and slim profile.",
    price: 3599,
    sale_price: null,
    currency: "USD" as CurrencyISO,
    stock_quantity: 200,
    is_public: false,
    imageUrls: ["https://picsum.photos/seed/jeans/400/600"],
    category_id: mockCategoryId,
  },
];

const baseAdmin: Prisma.UserCreateInput = {
  role: "ADMIN",
  name: ADMIN_NAME,
  email: ADMIN_EMAIL,
  verified: true,
  createdBy: "SELF",
  password: await bcrypt.hash(ADMIN_PASSWORD, 10),
  countryCode: ADMIN_COUNTRYCODE,
  currency: ADMIN_CURRENCY,
  cart: { create: {} },
};

const baseCurrency: Prisma.SettingsCreateInput = {
  key: BASE_CURRENCY_KEY,
  value: BASE_CURRENCY,
};

async function createAdmin(): Promise<void> {
  await Promise.all([
    prisma.user.create({
      data: baseAdmin,
    }),
    prisma.settings.create({
      data: baseCurrency,
    }),
  ]);
}

async function createMockProducts(): Promise<void> {
  await prisma.category.upsert({
    where: { id: mockCategoryId },
    update: {},
    create: mockCategory,
  });

  await prisma.product.createMany({
    data: mockProducts,
    skipDuplicates: true,
  });
}



export async function seedDb():Promise<void> {
  console.log(chalk.yellow(getTimestamp(),"Running DB seeder..."));
  try {
    console.log(chalk.yellow(getTimestamp(), "Checking if already populated the DB..."));

    const adminExists = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    const productsExist = await prisma.product.findFirst({
      select: { id: true },
    });

    if (!productsExist && SEED_PRODUCTS === "true") {
      console.log(chalk.yellow(getTimestamp(),"Seeding mock products..."));
      await createMockProducts();
      console.log(chalk.green(getTimestamp(), "Created Mock Products successfully!"));

    }

    if (!adminExists) {
      console.log(chalk.yellow(getTimestamp(), "Creating Admin..."));
      await createAdmin();
      console.log(
      chalk.green(getTimestamp(),"Created Admin successfully!"));
    }
    console.log(chalk.green(getTimestamp(),"Seeded DB succesfully!"))
  } catch (error) {
    console.error("Seeding error:", error);
  }
}