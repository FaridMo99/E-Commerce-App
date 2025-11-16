import {
  ordersQuerySchema,
  productsQuerySchema,
  reviewsQuerySchema,
} from "@monorepo/shared";
import type { NextFunction, Request, Response } from "express";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";

export function validateOrderSearchQueries(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const searchparams = req.query;

  const validated = ordersQuerySchema.safeParse(searchparams);
  if (!validated.success) {
    console.log(
      chalk.red(
        `${getTimestamp()} Order search query validation failed:`,
        searchparams
      )
    );
    return res.status(400).json({ message: validated.error.message });
  }

  console.log(
    chalk.green(`${getTimestamp()} Order search query validated successfully`)
  );
  next();
}

export function validateProductSearchQueries(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const searchparams = req.query;
  
  const validated = productsQuerySchema.safeParse(searchparams);
  if (!validated.success) {
    console.log(
      chalk.red(
        `${getTimestamp()} Product search query validation failed:`,
        searchparams
      )
    );
    return res.status(400).json({ message: validated.error.message });
  }

  console.log(
    chalk.green(`${getTimestamp()} Product search query validated successfully`)
  );

  next();
}

export function validateReviewSearchQueries(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const searchparams = req.query;

  const validated = reviewsQuerySchema.safeParse(searchparams);
  if (!validated.success) {
    console.log(
      chalk.red(
        `${getTimestamp()} Review search query validation failed:`,
        searchparams
      )
    );
    return res.status(400).json({ message: validated.error.message });
  }

  console.log(
    chalk.green(`${getTimestamp()} Review search query validated successfully`)
  );
  next();
}
