import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import redis from "../services/redis.js";
import { CATEGORIES_REDIS_KEY } from "../config/constants.js";
const cacheTime = 1800; //30min

export async function getAllProductCategories(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const cached = await redis.get(CATEGORIES_REDIS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return res.status(200).json(parsed);
    }

    const categories = await prisma.category.findMany();

    await redis.set(CATEGORIES_REDIS_KEY, JSON.stringify(categories), {
      EX: cacheTime,
    });

    return res.status(200).json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    next(err);
  }
}

export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const category = req.body.category;

  if (!category) return res.status(400).json({ message: "Category missing" });

  try {
    //check if already exists
    const exists = await prisma.category.findFirst({
      where: {
        name: category,
      },
    });
    if (exists)
      return res.status(400).json({ message: "Category already exists" });

    const newCategory = await prisma.category.create({
      data: { name: category },
    });
    await redis.del(CATEGORIES_REDIS_KEY);
    return res.status(201).json(newCategory);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = req.params.categoryId;

  if (!id) return res.status(400).json({ message: "Id missing" });

  try {
    await prisma.category.delete({ where: { id } });
    await redis.del(CATEGORIES_REDIS_KEY);
    return res.status(200).json({ message: "Delete successful" });
  } catch (err) {
    next(err);
  }
}
