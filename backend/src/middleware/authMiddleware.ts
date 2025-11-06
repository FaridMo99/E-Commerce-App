import { loginSchema, signupSchema } from "@monorepo/shared"
import chalk from "chalk";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JWTUserPayload } from "../types/types.js";


export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const validated = loginSchema.safeParse(req.body);

  if (!validated.success) return res.status(400).json({ message: validated.error.message });

  return next();
}

export function validateSignup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const validated = signupSchema.safeParse(req.body);

  if (!validated.success) return res.status(400).json({ message: validated.error.message });

  return next();
}

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  
  const token = req.cookies.jwt
  if (!token) return res.status(401).json({ message: "User not logged in" })
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as Partial<JWTUserPayload>;


    if (!payload.id || !payload.role) return res.status(403).json({ message: "Invalid token" })
    req.user = payload as JWTUserPayload;
    
    next()
  } catch (err) {
    console.log(chalk.red("Jwt token issue: " + err))
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

export async function isAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const role = req.user?.role
  if (!req.user || role !== "ADMIN" ) return res.status(403).json({ message: "User not authorized" })
  next()
}

export async function isAuthorizedUser(req: Request<{userId:string}>, res: Response, next: NextFunction) {
  const userMakingRequest = req.params.userId
  const realUser = req.user?.id;

  if (!userMakingRequest || !realUser || (realUser !== userMakingRequest)) return res.status(403).json({ message: "Forbidden" })
  
  next();
}