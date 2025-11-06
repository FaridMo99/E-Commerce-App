import { ordersQuerySchema } from "@monorepo/shared";
import type { NextFunction, Request, Response } from "express";

export function validateOrderSearchQueries(req:Request,res:Response,next:NextFunction){
    const searchparams = req.query

    const validated = ordersQuerySchema.safeParse(searchparams)
    if (!validated.success) return res.status(400).json({ message: validated.error.message })
    
    next()
}

export function validateProductSearchQueries(req: Request,res: Response,next: NextFunction) {
  const searchparams = req.query;

  const validated = ordersQuerySchema.safeParse(searchparams);
  if (!validated.success)
    return res.status(400).json({ message: validated.error.message });

  next();
}