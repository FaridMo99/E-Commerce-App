import { timeframeQuerySchema } from "@monorepo/shared";
import type { NextFunction, Request, Response } from "express";
import z, { ZodType } from "zod";
import { getTimestamp } from "../lib/utils.js";
import chalk from "chalk";
import { imageSchema } from "../config/schemas.js";


//error message wrong
export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    
    if (!parsed.success) {
      console.log(
        chalk.red(`${getTimestamp()} Body validation failed:`),
        req.body
      );
      return res.status(400).json({ message:parsed.error.message  });
    }

    req.body = parsed.data;
    console.log(chalk.green(`${getTimestamp()} Body validated successfully`));
    next();
  };
}

export function validateImages(req:Request,res:Response,next:NextFunction) {
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
  
  next()
}

export function validateTimeframeQuery(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const validated = timeframeQuerySchema.safeParse(req.query);
  if (!validated.success) {
    console.log(
      chalk.red(`${getTimestamp()} Timeframe query validation failed`)
    );
    return res.status(400).json({ error: validated.error.message });
  }

  const now = new Date();
  const from = validated.data.from;
  const to = validated.data.to ?? now;

  req.timeframe = { from, to };
  console.log(
    chalk.green(`${getTimestamp()} Timeframe query validated successfully`)
  );
  next();
}

export function validateSearchQueries<T>(schema: ZodType<T>) {
  return function validateQuery(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    console.log(1,req.query)
    const validated = schema.safeParse(req.query);

    if (!validated.success) {
      console.log(
        chalk.red(
          `${getTimestamp()} Query validation failed: ${JSON.stringify(req.query)}`
        )
      );
      return res.status(400).json({message:validated.error.message})
    }

    console.log(chalk.green(`${getTimestamp()} Query validation succeeded`));


    // Express makes issues so unavoidable
    req.validatedQuery = validated.data
    
    next();
  };
} 