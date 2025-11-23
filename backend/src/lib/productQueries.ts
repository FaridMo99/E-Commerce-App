import { CATEGORIES_REDIS_KEY, TIME_DIFFERENCE_FOR_NEW_PRODUCTS_IN_DAYS } from "../config/constants.js";
import type {
  Category,
} from "../generated/prisma/client.js";
import prisma from "../services/prisma.js";
import redis from "../services/redis.js";
import {
  NEW_PRODUCTS_REDIS_KEY,
  TRENDING_PRODUCTS_REDIS_KEY,
  SALE_PRODUCTS_REDIS_KEY,
  TWELVE_HOURS_IN_SECONDS,
} from "../config/constants.js";
import { productSelect, productWhere, type ProductWithSelectedFields } from "../config/prismaHelpers.js";

const limit = 10;

export async function getNewProducts(): Promise<ProductWithSelectedFields[]> {

  const cached = await redis.get(NEW_PRODUCTS_REDIS_KEY);
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
      ...productSelect,
    },
  });

  await redis.set(NEW_PRODUCTS_REDIS_KEY, JSON.stringify(products), {
    EX: TWELVE_HOURS_IN_SECONDS,
  });

  return products;
}

export async function getSaleProducts(): Promise<ProductWithSelectedFields[]> {

  const cached = await redis.get(SALE_PRODUCTS_REDIS_KEY);
  if (cached) return JSON.parse(cached) as ProductWithSelectedFields[];

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

export async function getCategoryProducts(category: Category["name"]): Promise<ProductWithSelectedFields[]> {
  const cached = await redis.get(CATEGORIES_REDIS_KEY);
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
      ...productSelect,
    },
  });

  await redis.set(CATEGORIES_REDIS_KEY, JSON.stringify(products), { EX: 1800 });
  return products;
}

export async function getTrendingProducts(): Promise<ProductWithSelectedFields[]> {

  const cached = await redis.get(TRENDING_PRODUCTS_REDIS_KEY);
  if (cached) return JSON.parse(cached) as ProductWithSelectedFields[];

  const timeDifference = new Date();
  timeDifference.setDate(
    timeDifference.getDate() - TIME_DIFFERENCE_FOR_NEW_PRODUCTS_IN_DAYS
  );

  // fetch all products with computed metrics
  const trending = await prisma.product.findMany({
    where: {
      ...productWhere,
      published_at: { gte: timeDifference },
    },
    select: {
      ...productSelect,
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

  await redis.set(TRENDING_PRODUCTS_REDIS_KEY, JSON.stringify(returnProducts), {
    EX: 1800,
  });

  return returnProducts;
}