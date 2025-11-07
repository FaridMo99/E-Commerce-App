import { productSchema, reviewSchema, timeframeQuerySchema, updateProductSchema } from "@monorepo/shared";
import type { NextFunction, Request, Response } from "express";
import z from "zod";

//some middleware parses back to body and some doesnt, make all middleware validation to just two 
//zods parsed.error.message could be wrong to send back, check later

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

export function validateReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const review = req.body;

  const validated = reviewSchema.safeParse(review);
  if (!validated.success)
    return res.status(400).json({ message: validated.error.message });

  next();
}

export function validateUpdateProduct(req: Request,res: Response,next: NextFunction) {
  const product = req.body;
    
  const validated = updateProductSchema.safeParse(product);
  if (!validated.success)return res.status(400).json({ message: validated.error.message });

  next();
}

export function validateTimeframeQuery(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsed = timeframeQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.message });
  }

  const now = new Date();

  const from = parsed.data.from; 
  const to = parsed.data.to ?? now; 

  req.timeframe = { from, to };

  next();
}