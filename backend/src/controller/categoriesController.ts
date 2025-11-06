import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";

export async function getAllProductCategories(req:Request,res:Response,next:NextFunction) {
    try {
        const categories = await prisma.category.findMany()
        return res.status(200).json(categories)
    } catch (err) {
        next(err)
    }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
    const category = req.body.category

    if (!category) return res.status(400).json({ message: "Category missing" })
    
    try {
        //check if already exists
        const exists = await prisma.category.findFirst({
            where: {
                name:category
            }
        })
        if (exists) return res.status(400).json({ message: "Category already exists" })
        
        const newCategory = await prisma.category.create({ data: { name: category } })
        return res.status(201).json(newCategory)
    } catch (err) {
        next(err)
    }
}

export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = req.params.categoryId;

    if (!id) return res.status(400).json({ message: "Id missing" })
    
  try {
    const category = await prisma.category.delete({where: { id }});
    return res.status(200).json({name:category.name});
  } catch (err) {
    next(err);
  }
}