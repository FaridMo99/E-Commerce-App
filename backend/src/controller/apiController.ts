import type { Request, Response, NextFunction } from "express";

export async function healthStatus(
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
    return res.status(200).send("OK")
}