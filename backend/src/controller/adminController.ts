//add to each searchqueries to get certain timeframes

import type { Request, Response, NextFunction } from "express";

export async function getRevenue(req: Request, res: Response, next: NextFunction) { }

export async function getOrders(
  req: Request,
  res: Response,
  next: NextFunction
) { }

export async function getOrdersByCategory(
  req: Request,
  res: Response,
  next: NextFunction
) { }

export async function getTopsellers(
  req: Request,
  res: Response,
  next: NextFunction
) { }

export async function getNewUsers(
  req: Request,
  res: Response,
  next: NextFunction
) { }

export async function getLowestStockAmount(
  req: Request,
  res: Response,
  next: NextFunction
) { }

export async function getReviews(
  req: Request,
  res: Response,
  next: NextFunction
) {}