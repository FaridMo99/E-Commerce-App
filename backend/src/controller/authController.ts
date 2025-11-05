import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

// dont forget hashing
export async function login(req: Request, res: Response, next: NextFunction) {}

export async function signup(req: Request, res: Response, next: NextFunction) {}

export async function logout(req: Request, res: Response, next: NextFunction) {}

export async function verifyUser(
  req: Request,
  res: Response,
  next: NextFunction
) {}
