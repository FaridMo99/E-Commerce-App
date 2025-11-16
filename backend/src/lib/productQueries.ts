import { TIME_DIFFERENCE_FOR_NEW_PRODUCTS_IN_DAYS } from "../config/constants.js";
import type { Category, Product } from "../generated/prisma/client.js";
import prisma from "../services/prisma.js";
import redis from "../services/redis.js";
import {
  NEW_PRODUCTS_REDIS_KEY,
  TRENDING_PRODUCTS_REDIS_KEY,
  SALE_PRODUCTS_REDIS_KEY,
  TWELVE_HOURS_IN_SECONDS,
} from "../config/constants.js";
import { productSelect, productWhere } from "../config/prismaHelpers.js";

const limit = 10;

export async function getNewProducts(): Promise<Product[]> {
  const cached = await redis.get(NEW_PRODUCTS_REDIS_KEY);
  if (cached) return JSON.parse(cached) as Product[];

  const timeDifference = new Date();
  timeDifference.setDate(
    timeDifference.getDate() - TIME_DIFFERENCE_FOR_NEW_PRODUCTS_IN_DAYS,
  );

  const products = await prisma.product.findMany({
    where: {
      published_at: { gte: timeDifference },
      ...productWhere,
    },
    orderBy: {
      published_at: "desc",
    },
    take: limit,
    select: {
      ...productSelect
    }
  });

  await redis.set(NEW_PRODUCTS_REDIS_KEY, JSON.stringify(products), {
    EX: TWELVE_HOURS_IN_SECONDS,
  });

  return products;
}

export async function getSaleProducts(): Promise<Product[]> {
  const cached = await redis.get(SALE_PRODUCTS_REDIS_KEY);
  if (cached) return JSON.parse(cached) as Product[];

  const products = await prisma.product.findMany({
    where: {
      ...productWhere,
      sale_price: {
        not: null,
      },
    },
    orderBy: {
      published_at: "desc",
    },
    take: limit,
    select: {
      ...productSelect,
    },
  });

  await redis.set(SALE_PRODUCTS_REDIS_KEY, JSON.stringify(products), {
    EX: TWELVE_HOURS_IN_SECONDS,
  });

  return products;
}

export async function getCategoryProducts(
  category: Category["name"],
): Promise<Product[]> {
  const key = `categoryProducts:${category}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached) as Product[];

  const products = await prisma.product.findMany({
    where: {
      ...productWhere,
      category: {
        name: category,
      },
    },
    orderBy: {
      published_at: "desc",
    },
    take: limit,
    select: {
      ...productSelect,
    },
  });

  await redis.set(key, JSON.stringify(products), { EX: 1800 });
  return products;
}

export async function getRecentlyViewedProducts(
  userId: string,
): Promise<Product[]> {
  const recentlyViewed = await prisma.recentlyViewed.findMany({
    where: { userId },
    orderBy: {
      viewedAt: "desc",
    },
    take: limit,
    select: {
      product: {
        select: {
          ...productSelect,
        },
      },
    },
  });

  return recentlyViewed.map((rv) => rv.product);
}

export async function getTrendingProducts(): Promise<Product[]> {
  const cached = await redis.get(TRENDING_PRODUCTS_REDIS_KEY);
  if (cached) return JSON.parse(cached) as Product[];
  const timeDifference = new Date();
  timeDifference.setDate(
    timeDifference.getDate() - TIME_DIFFERENCE_FOR_NEW_PRODUCTS_IN_DAYS,
  );

  // fetch all products with computed metrics
  const trending = await prisma.product.findMany({
    where: {
      ...productWhere,
      published_at: { not: null },
    },
      select: {
        ...productSelect,
      },
  });

  // compute trending score
  const productsWithScore = trending.map((p) => {
    const salesCount = p.order_items.length;
    const favoritesCount = p.favoredBy.length;
    const viewsCount = p.recentlyViewed.length;

    const score = salesCount * 0.5 + favoritesCount * 0.3 + viewsCount * 0.2;

    return { ...p, score };
  });

  // sort by score descending and take limit
  const topTrending = productsWithScore
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // remove metrics, only keep product fields
  const returnProducts = topTrending.map(
    ({ order_items, favoredBy, recentlyViewed, score, ...product }) => product,
  );

  await redis.set(TRENDING_PRODUCTS_REDIS_KEY, JSON.stringify(returnProducts), {
    EX: 1800,
  });

  return returnProducts;
}
