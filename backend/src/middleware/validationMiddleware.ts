import { productSchema, updateProductSchema } from "@monorepo/shared";
import type { NextFunction, Request, Response } from "express";

export function validateProduct(req: Request,res: Response,next: NextFunction) {
  const product = req.body;

  const validated = productSchema.safeParse(product);
  if (!validated.success) return res.status(400).json({ message: validated.error.message });

  next();
}

export function validateUpdateProduct(req: Request,res: Response,next: NextFunction) {
  const product = req.body;
    
  const validated = updateProductSchema.safeParse(product);
  if (!validated.success)return res.status(400).json({ message: validated.error.message });

  next();
}