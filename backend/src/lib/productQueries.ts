import {
  CATEGORIES_REDIS_KEY,
  CATEGORY_CACHE_TIME,
  TIME_DIFFERENCE_FOR_NEW_PRODUCTS_IN_DAYS,
} from "../config/constants.js";
import type { Category, Product } from "../generated/prisma/client.js";
import prisma from "../services/prisma.js";
import redis from "../services/redis.js";
import {
  NEW_PRODUCTS_REDIS_KEY,
  TRENDING_PRODUCTS_REDIS_KEY,
  SALE_PRODUCTS_REDIS_KEY,
  HOME_PRODUCTS_CACHE_TIME,
} from "../config/constants.js";
import {
  categorySelect,
  productSelect,
  productWhere,
  type ProductWithSelectedFields,
} from "../config/prismaHelpers.js";
import { getTimestamp } from "./utils.js";
import chalk from "chalk";

const limit = 10;

type AllProductCachesReturn = {
  isInNewProducts: boolean;
  isInSaleProducts: boolean;
  isInCategoryProducts: boolean;
  isInTrendingProducts: boolean;
};

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
    EX: HOME_PRODUCTS_CACHE_TIME,
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
    EX: HOME_PRODUCTS_CACHE_TIME,
  });

  return products;
}

export async function getCategoryProducts(category: Category["name"]): Promise<ProductWithSelectedFields[]> {
  const redisKey = `${CATEGORIES_REDIS_KEY}:${category}`;
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
      ...productSelect,
    },
  });

  await redis.set(redisKey, JSON.stringify(products), { EX: 1800 });
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
          recentlyViewed: true,
        },
      },
    },
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
  const returnProducts = topTrending.map((product) => {
    const { _count, score, ...productRest } = product;
    const { favoredBy, order_items, recentlyViewed, ...countRest } = _count;

    productRest._count = { ...countRest };
    return productRest as ProductWithSelectedFields;
  });

  await redis.set(TRENDING_PRODUCTS_REDIS_KEY, JSON.stringify(returnProducts), {
    EX: 1800,
  });

  return returnProducts;
}

export async function getCategories(): Promise<Category[]> {
  const cached = await redis.get(CATEGORIES_REDIS_KEY);

  if (cached) {
    const parsed: Category[] = JSON.parse(cached);
    console.log(
      chalk.green(
        `${getTimestamp()} Categories fetched from cache (${parsed.length})`
      )
    );
    return parsed;
  }

  const categories = await prisma.category.findMany({
    select: {
      ...categorySelect,
    },
  });
  await redis.set(CATEGORIES_REDIS_KEY, JSON.stringify(categories), {
    EX: CATEGORY_CACHE_TIME,
  });

  console.log(
    chalk.green(
      `${getTimestamp()} Categories fetched from DB and cached (${categories.length})`
    )
  );
  return categories;
}

export async function clearAllProductCaches(
  productCategory: Category["name"]
): Promise<void> {
  const redisKey = `${CATEGORIES_REDIS_KEY}:${productCategory}`;

  await Promise.all([
    redis.del(NEW_PRODUCTS_REDIS_KEY),
    redis.del(SALE_PRODUCTS_REDIS_KEY),
    redis.del(CATEGORIES_REDIS_KEY),
    redis.del(redisKey),
    redis.del(TRENDING_PRODUCTS_REDIS_KEY),
  ]);
}

export async function getAllProductCaches(
  productName: Product["name"],
  productCategory: Category["name"]
): Promise<AllProductCachesReturn> {
  const categoryRedisKey = `${CATEGORIES_REDIS_KEY}:${productCategory}`;

  const [newRaw, saleRaw, categoryRaw, trendingRaw] = await Promise.all([
    redis.get(NEW_PRODUCTS_REDIS_KEY),
    redis.get(SALE_PRODUCTS_REDIS_KEY),
    redis.get(categoryRedisKey),
    redis.get(TRENDING_PRODUCTS_REDIS_KEY),
  ]);

  const check = (raw: string | null) => {
    if (!raw) return false;
    const items: ProductWithSelectedFields[] = JSON.parse(raw);
    return items.some((item) => item.name === productName);
  };

  return {
    isInNewProducts: check(newRaw),
    isInSaleProducts: check(saleRaw),
    isInCategoryProducts: check(categoryRaw),
    isInTrendingProducts: check(trendingRaw),
  };
}

export async function clearAllCachesProductIsIn(
  productName: Product["name"],
  productCategory: Category["name"]
): Promise<void> {
  const caches = await getAllProductCaches(productName, productCategory);

  const keysToDelete: string[] = [];

  if (caches.isInNewProducts) keysToDelete.push(NEW_PRODUCTS_REDIS_KEY);
  if (caches.isInSaleProducts) keysToDelete.push(SALE_PRODUCTS_REDIS_KEY);
  if (caches.isInTrendingProducts)
    keysToDelete.push(TRENDING_PRODUCTS_REDIS_KEY);
  if (caches.isInCategoryProducts) {
    keysToDelete.push(`${CATEGORIES_REDIS_KEY}:${productCategory}`);
    keysToDelete.push(CATEGORIES_REDIS_KEY);
  }

  if (keysToDelete.length > 0) {
    await Promise.all(keysToDelete.map((key) => redis.del(key)));
  }
}