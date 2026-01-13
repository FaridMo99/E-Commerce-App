import type { Request, Response, NextFunction } from "express";

export async function healthStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
    return res.status(200).send("OK")
}