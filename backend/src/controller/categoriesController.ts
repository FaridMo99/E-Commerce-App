import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import redis from "../services/redis.js";
import { CATEGORIES_REDIS_KEY } from "../config/constants.js";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";
import { categorySelect } from "../config/prismaHelpers.js";

const cacheTime = 1800; // 30min

export async function getAllProductCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Fetching all product categories...`)
    );

    const cached = await redis.get(CATEGORIES_REDIS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      console.log(
        chalk.green(
          `${getTimestamp()} Categories fetched from cache (${parsed.length})`
        )
      );
      return res.status(200).json(parsed);
    }

    const categories = await prisma.category.findMany({
      select: {
        ...categorySelect
      }
    });
    await redis.set(CATEGORIES_REDIS_KEY, JSON.stringify(categories), {
      EX: cacheTime,
    });

    console.log(
      chalk.green(
        `${getTimestamp()} Categories fetched from DB and cached (${categories.length})`
      )
    );
    return res.status(200).json(categories);
  } catch (err) {
    console.log(chalk.red(`${getTimestamp()} Error fetching categories:`), err);
    next(err);
  }
}

export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const category = req.body.category;

  if (!category) {
    console.log(
      chalk.red(`${getTimestamp()} Category missing in request body`)
    );
    return res.status(400).json({ message: "Category missing" });
  }

  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Creating category: ${category}`)
    );

    const exists = await prisma.category.findFirst({
      where: {
        name: category
      },
      select: {
        ...categorySelect
      }
    });
    if (exists) {
      console.log(
        chalk.red(`${getTimestamp()} Category already exists: ${category}`)
      );
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = await prisma.category.create({
      data: { name: category },
    });
    await redis.del(CATEGORIES_REDIS_KEY);

    console.log(chalk.green(`${getTimestamp()} Category created: ${category}`));
    return res.status(201).json(newCategory);
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Error creating category: ${category}`),
      err
    );
    next(err);
  }
}

export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = req.params.categoryId;

  if (!id) {
    console.log(chalk.red(`${getTimestamp()} Category ID missing in request`));
    return res.status(400).json({ message: "Id missing" });
  }

  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Deleting category with ID: ${id}`)
    );

    const productCount = await prisma.product.count({
      where: {
        category_id:id
      },
    });

    if(productCount > 0) return res.status(400).json({message:`You still have ${productCount} products in that category, please move them first`})

    await Promise.all([
      prisma.category.delete({ where: { id } }),
      redis.del(CATEGORIES_REDIS_KEY),
    ]);

    console.log(
      chalk.green(`${getTimestamp()} Category deleted with ID: ${id}`)
    );
    return res.status(200).json({ message: "Delete successful" });
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Error deleting category with ID: ${id}`),
      err
    );
    next(err);
  }
}
