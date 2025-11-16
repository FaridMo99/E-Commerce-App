import {
  addCartItemSchema,
  itemQuantitySchema,
  loginSchema,
  productSchema,
  reviewSchema,
  settingsSchema,
  timeframeQuerySchema,
  updateProductSchema,
} from "@monorepo/shared";
import type { NextFunction, Request, Response } from "express";
import z from "zod";
import { getTimestamp } from "../lib/utils.js";
import chalk from "chalk";

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


export function validateProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const product = req.body;
  const images = req.files;

  if (images && Array.isArray(images)) {
    const validatedImages = z.array(imageSchema).safeParse(images);
    if (!validatedImages.success) {
      console.log(
        chalk.red(`${getTimestamp()} Product validation failed (images)`)
      );
      return res.status(400).json({ message: validatedImages.error.message });
    }
  }
  const validatedProduct = productSchema.safeParse(product);
  if (!validatedProduct.success) {
    console.log(
      chalk.red(`${getTimestamp()} Product validation failed (body)`)
    );
    return res.status(400).json({ message: validatedProduct.error.message });
  }

  console.log(chalk.green(`${getTimestamp()} Product validated successfully`));
  next();
}

export function validateReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const review = req.body;

  const validated = reviewSchema.safeParse(review);
  if (!validated.success) {
    console.log(chalk.red(`${getTimestamp()} Review validation failed`));
    return res.status(400).json({ message: validated.error.message });
  }

  console.log(chalk.green(`${getTimestamp()} Review validated successfully`));
  next();
}

export function validateUpdateProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const product = req.body;

  const validated = updateProductSchema.safeParse(product);
  if (!validated.success) {
    console.log(
      chalk.red(`${getTimestamp()} Update product validation failed`)
    );
    return res.status(400).json({ message: validated.error.message });
  }

  console.log(
    chalk.green(`${getTimestamp()} Update product validated successfully`)
  );
  next();
}

export function validateTimeframeQuery(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsed = timeframeQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    console.log(
      chalk.red(`${getTimestamp()} Timeframe query validation failed`)
    );
    return res.status(400).json({ error: parsed.error.message });
  }

  const now = new Date();
  const from = parsed.data.from;
  const to = parsed.data.to ?? now;

  req.timeframe = { from, to };
  console.log(
    chalk.green(`${getTimestamp()} Timeframe query validated successfully`)
  );
  next();
}

export function validateEmail(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body;
  if (!email) {
    console.log(chalk.red(`${getTimestamp()} Email missing in request`));
    return res.status(400).json({ message: "Email missing" });
  }
  if (!loginSchema.shape.email.safeParse(email).success) {
    console.log(chalk.red(`${getTimestamp()} Invalid email: ${email}`));
    return res.status(400).json({ message: "Invalid Email" });
  }

  console.log(
    chalk.green(`${getTimestamp()} Email validated successfully: ${email}`)
  );
  next();
}

export function validateItemQuantity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { quantity } = req.body;

  const validated = itemQuantitySchema.safeParse(quantity);
  if (!validated.success) {
    console.log(chalk.red(`${getTimestamp()} Item quantity validation failed`));
    return res.status(400).json({ message: validated.error.message });
  }

  console.log(
    chalk.green(`${getTimestamp()} Item quantity validated successfully`)
  );
  next();
}

export function validateCartItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const item = req.body;

  const validated = addCartItemSchema.safeParse(item);
  if (!validated.success) {
    console.log(chalk.red(`${getTimestamp()} Cart item validation failed`));
    return res.status(400).json({ message: validated.error.message });
  }

  console.log(
    chalk.green(`${getTimestamp()} Cart item validated successfully`)
  );
  next();
}

export function validateProductId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { productId } = req.body;

  const validated = addCartItemSchema.shape.productId.safeParse(productId);
  if (!validated.success) {
    console.log(chalk.red(`${getTimestamp()} Product ID validation failed`));
    return res.status(400).json({ message: validated.error.message });
  }

  console.log(
    chalk.green(`${getTimestamp()} Product ID validated successfully`)
  );
  next();
}

export function validateSettings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const body = req.body;

  const validated = settingsSchema.safeParse(body);
  if (!validated.success) {
    console.log(chalk.red(`${getTimestamp()} Settings validation failed`));
    return res.status(400).json({ message: validated.error.message });
  }

  console.log(chalk.green(`${getTimestamp()} Settings validated successfully`));
  next();
}