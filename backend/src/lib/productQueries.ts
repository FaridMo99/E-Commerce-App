import { TIME_DIFFERENCE_FOR_NEW_PRODUCTS_IN_DAYS } from "../config/constants.js";
import type {
  Category,
  CurrencyISO,
} from "../generated/prisma/client.js";
import prisma from "../services/prisma.js";
import redis from "../services/redis.js";
import {
  NEW_PRODUCTS_REDIS_KEY,
  TRENDING_PRODUCTS_REDIS_KEY,
  SALE_PRODUCTS_REDIS_KEY,
  TWELVE_HOURS_IN_SECONDS,
} from "../config/constants.js";
import { productSelect, productSelector, productWhere, type ProductWithSelectedFields } from "../config/prismaHelpers.js";

const limit = 10;

export async function getNewProducts(
  currency: CurrencyISO
): Promise<ProductWithSelectedFields[]> {
  const redisKey = `${NEW_PRODUCTS_REDIS_KEY}:${currency}`;

  const cached = await redis.get(redisKey);
  if (cached) return JSON.parse(cached) as ProductWithSelectedFields[];

  const timeDifference = new Date();
  timeDifference.setDate(
    timeDifference.getDate() - TIME_DIFFERENCE_FOR_NEW_PRODUCTS_IN_DAYS
  );

  const products = await prisma.product.findMany({
    where: {
      published_at: { gte: timeDifference },
      ...productWhere,
    },
    orderBy: {
      published_at: "desc",
    },
    select: {
      ...productSelector(currency),
    },
  });

  await redis.set(redisKey, JSON.stringify(products), {
    EX: TWELVE_HOURS_IN_SECONDS,
  });

  return products;
}

export async function getSaleProducts(
  currency: CurrencyISO
): Promise<ProductWithSelectedFields[]> {
    const redisKey = `${SALE_PRODUCTS_REDIS_KEY}:${currency}`;

  const cached = await redis.get(redisKey);
  if (cached) return JSON.parse(cached) as ProductWithSelectedFields[];

  const salePriceField =
    `sale_price_in_${currency}` as keyof typeof productSelect;

  const products = await prisma.product.findMany({
    where: {
      ...productWhere,
      [salePriceField]: {
        not: null,
      },
    },
    orderBy: {
      published_at: "desc",
    },
    take: limit,
    select: {
      ...productSelector(currency),
    },
  });

  await redis.set(redisKey, JSON.stringify(products), {
    EX: TWELVE_HOURS_IN_SECONDS,
  });

  return products;
}

export async function getCategoryProducts(
  category: Category["name"],
  currency: CurrencyISO
): Promise<ProductWithSelectedFields[]> {
  const redisKey = `categoryProducts:${category}:currency:${currency}`;
  const cached = await redis.get(redisKey);
  if (cached) return JSON.parse(cached) as ProductWithSelectedFields[];

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
      ...productSelector(currency),
    },
  });

  await redis.set(redisKey, JSON.stringify(products), { EX: 1800 });
  return products;
}

export async function getTrendingProducts(
  currency: CurrencyISO
): Promise<ProductWithSelectedFields[]> {
  const redisKey = `${TRENDING_PRODUCTS_REDIS_KEY}:${currency}`;

  const cached = await redis.get(redisKey);
  if (cached) return JSON.parse(cached) as ProductWithSelectedFields[];

  const timeDifference = new Date();
  timeDifference.setDate(
    timeDifference.getDate() - TIME_DIFFERENCE_FOR_NEW_PRODUCTS_IN_DAYS
  );

  // fetch all products with computed metrics
  const trending = await prisma.product.findMany({
    where: {
      ...productWhere,
      published_at: { not: null },
    },
    select: {
      ...productSelector(currency),
      _count: {
        select: {
          order_items: true,
          favoredBy: true,
          recentlyViewed: true
        }
      }
    }
  });

  // compute trending score
  const productsWithScore = trending.map((p) => {
      const salesCount = p._count.order_items;
      const favoritesCount = p._count.favoredBy;
      const viewsCount = p._count.recentlyViewed;

      const score = salesCount * 0.5 + favoritesCount * 0.3 + viewsCount * 0.2;

      return { ...p, score };
  });

  // sort by score descending and take limit
  const topTrending = productsWithScore
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // remove metrics, only keep product fields
  const returnProducts = topTrending.map(product => {
    const { _count, score, ...productRest } = product
    const { favoredBy, order_items, recentlyViewed, ...countRest } = _count
    
    productRest._count = {...countRest}
    return productRest as ProductWithSelectedFields
  })

  await redis.set(redisKey, JSON.stringify(returnProducts), {
    EX: 1800,
  });

  return returnProducts;
}