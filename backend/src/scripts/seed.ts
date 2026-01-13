import "../config/env.js";
import "../config/constants.js";
import "../services/prisma.js";
import type { CurrencyISO, Prisma } from "../generated/prisma/client.js";
import prisma from "../services/prisma.js";
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import { BASE_CURRENCY_KEY } from "../config/constants.js";

const ADMIN_NAME = process.env.ADMIN_NAME!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const ADMIN_COUNTRYCODE = process.env.ADMIN_COUNTRYCODE!;
const ADMIN_CURRENCY = process.env.ADMIN_CURRENCY as CurrencyISO;
const BASE_CURRENCY = process.env.BASE_CURRENCY as CurrencyISO;
const SEED_PRODUCTS = process.env.SEED_PRODUCTS!;

export const mockCategoryId = "MockClothingId"

export const mockCategory: Prisma.CategoryCreateInput = {
  name: "Clothes",
  id:mockCategoryId
}

export const mockProducts: Prisma.ProductCreateManyInput[] = [
  {
    name: "Classic Cotton T-Shirt",
    description:
      "A comfortable, 100% cotton t-shirt perfect for everyday wear.",
    price: 2500,
    sale_price: 2000,
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
    price: 12000,
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
    price: 5500,
    sale_price: 4500,
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
    price: 3500,
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

async function createAdmin():Promise<void> {
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
    create:mockCategory,
  });

  await prisma.product.createMany({
    data: mockProducts,
    skipDuplicates:true
  })
}

async function checkIfSeeded() {
  const adminExists = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
    },
  });

  const productsExist = await prisma.product.findFirst({
    select: { id: true },
  });


  if (!productsExist && SEED_PRODUCTS === "true") {
    await createMockProducts()
  }


  if (!adminExists) {
    await createAdmin();
  }
}

await checkIfSeeded();
