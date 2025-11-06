import { productSchema, updateProductSchema } from "@monorepo/shared";
import type { NextFunction, Request, Response } from "express";
import z from "zod";

const maxSize = 5 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

const imageSchema = z.object({
  originalname: z.string().max(255),
  mimetype: z.enum(allowedTypes),
  size: z.number().max(maxSize),
  buffer: z.instanceof(Buffer),
});

export function validateProduct(req: Request,res: Response,next: NextFunction) {
  const product = req.body;
  const images = req.files

  if (images && Array.isArray(images)) {
    const validatedImages = z.array(imageSchema).safeParse(images);
    if (!validatedImages.success) {
      return res.status(400).json({ message: validatedImages.error.message });
    }
  }
  const validatedProduct = productSchema.safeParse(product);
  if (!validatedProduct.success) return res.status(400).json({ message: validatedProduct.error.message });

  next();
}

export function validateUpdateProduct(req: Request,res: Response,next: NextFunction) {
  const product = req.body;
    
  const validated = updateProductSchema.safeParse(product);
  if (!validated.success)return res.status(400).json({ message: validated.error.message });

  next();
}