import type { Request, Response, NextFunction } from "express";
import {
  loginSchema,
  type LoginSchema,
  type SignupSchema,
} from "@monorepo/shared";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../services/prisma.js";
import redis from "../services/redis.js";
import { sendVerificationEmail } from "../services/email.js";
import { issueTokens } from "../lib/auth.js";
import { JWT_EMAIL_TOKEN_SECRET, NODE_ENV } from "../config/env.js";

export async function login(
  req: Request<{}, {}, LoginSchema>,
  res: Response,
  next: NextFunction,
) {
  const { email, password } = req.body;
  try {
    //fix the return of cart products and orders, rn sending too much, also for verify user
    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        cart: true,
        orders: true,
      },
    });

    if (!user)
      return res.status(401).json({ message: "Email or Password is wrong" });
    if (!user.verified)
      return res.status(400).json({ message: "Account not verified yet" });

    if (!user.password && user.createdBy !== "SELF") {
      const formattedOAuthProvider = user.createdBy.charAt(0).toUpperCase() + user.createdBy.slice(1).toLowerCase()
      
      return res
            .status(401)
            .json({ message: `You logged in last time with ${formattedOAuthProvider}. Please log in again with ${formattedOAuthProvider} and set a password in Account Settings to use this login.` });
        }

    if (!user.password)
      return res.status(401).json({ message: "Email or Password is wrong" });

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch)
      return res.status(401).json({ message: "Email or Password is wrong" });

    const accessToken = await issueTokens(user, res);

    return res.status(200).json({ accessToken, user });
  } catch (err) {
    next(err);
  }
}

export async function signup(
  req: Request<{}, {}, SignupSchema>,
  res: Response,
  next: NextFunction,
) {
  const { email, password, name, birthdate, address } = req.body;
  try {
    //check if email already exists
    const emailExists = await prisma.user.findFirst({ where: { email } });
    if (emailExists)
      return res.status(400).json({ message: "Email already in use" });

    //create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        ...(birthdate && { birthdate }),
        ...(address && { address }),
        password: await bcrypt.hash(password, 10),
        createdBy: "SELF",
        cart: { create: {} },
      },
    });

    //send email to verify, token only valid 24 hours
    const token = jwt.sign({ id: user.id }, JWT_EMAIL_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    await redis.setEx(`verifyToken:${user.id}`, 60 * 60 * 24, token);

    await sendVerificationEmail(user.email, "verify-success", token);
    return res
      .status(201)
      .json({ message: "Signup successful, verify your Email." });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.refreshTokenPayload!;

    if (token) {
      await prisma.refreshToken.deleteMany({
        where: {
          deviceId: token.deviceId,
          userId: token.userId,
        },
      });
    }

    res.cookie("refreshToken", "", {
      httpOnly: true,
      secure: NODE_ENV !== "dev",
      expires: new Date(0),
      path: "/",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
}

export async function verifyUser(
  req: Request<{}, {}, { token: string | undefined }>,
  res: Response,
  next: NextFunction,
) {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    //Verify JWT signature
    const payload = jwt.verify(token, JWT_EMAIL_TOKEN_SECRET) as {
      id: string;
    };
    const userId = payload.id;

    //Look up token in Redis
    const storedToken = await redis.get(`verifyToken:${userId}`);
    if (!storedToken) {
      return res.status(400).json({ message: "Token expired or already used" });
    }

    if (storedToken !== token) {
      return res.status(400).json({ message: "Invalid token" });
    }

    //Mark user as verified
    const user = await prisma.user.update({
      where: { id: userId },
      data: { verified: true },
      include: {
        cart: true,
        orders: true,
      },
    });

    //Delete token from Redis
    await redis.del(`verifyToken:${userId}`);

    //create token for logging in
    const accessToken = await issueTokens(user, res);

    return res.status(200).json({ accessToken, user });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ message: "Token expired" });
    }
    return next(err);
  }
}

export async function sendNewVerifyLink(
  req: Request<{}, {}, { email: string }>,
  res: Response,
  next: NextFunction,
) {
  const { email } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { email },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.verified)
      return res.status(400).json({ message: "User already verified" });

    await redis.del(`verifyToken:${user.id}`);
    const token = jwt.sign({ id: user.id }, JWT_EMAIL_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    await redis.setEx(`verifyToken:${user.id}`, 60 * 60 * 24, token);

    await sendVerificationEmail(user.email, "verify-success", token);
    return res
      .status(201)
      .json({ message: "Sent new Link, check your Email." });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(
  req: Request<{}, {}, { password?: string; token?: string }>,
  res: Response,
  next: NextFunction,
) {
  const { password, token } = req.body;

  if (!password && !token)
    return res.status(400).json({ message: "Token and Password missing" });
  if (!password) return res.status(400).json({ message: "Password missing" });
  if (!token) return res.status(400).json({ message: "Token missing" });

  const validatedPassword = loginSchema.shape.password.safeParse(password);
  //change the messsage later, could be wrong
  if (!validatedPassword.success)
    return res.status(400).json({ message: validatedPassword.error.message });

  try {
    const payload = jwt.verify(token, JWT_EMAIL_TOKEN_SECRET) as {
      id: string;
    };

    const redisTokenKey = `changePasswordUserId:${payload.id}`;
    const redisToken = await redis.get(redisTokenKey);

    if (!redisToken)
      return res.status(404).json({ message: "Invalid or expired Link" });
    if (redisToken !== token)
      return res.status(403).json({ message: "Invalid Link" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: payload.id },
      data: { password: hashedPassword },
      include: {
        cart: true,
        orders: true,
      },
    });

    await redis.del(redisTokenKey);

    const accessToken = await issueTokens(user, res);

    return res.status(200).json({ accessToken, user });
  } catch (err) {
    next(err);
  }
}

export async function sendEmailToChangePassword(
  req: Request<{}, {}, { email: string }>,
  res: Response,
  next: NextFunction,
) {
  const email = req.body.email;

  try {
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user)
      return res
        .status(404)
        .json({ message: `User with E-Mail: ${email} does not exist.` });

    const token = jwt.sign({ id: user.id }, JWT_EMAIL_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    await redis.del(`changePasswordUserId:${user.id}`);
    await redis.setEx(`changePasswordUserId:${user.id}`, 60 * 60 * 24, token);
    await sendVerificationEmail(email, "change-password", token);

    return res.status(200).json({ message: "success" });
  } catch (err) {
    next(err);
  }
}

export async function issueRefreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.refreshTokenPayload!;
  const rawToken = req.cookies.refreshToken as string;

  try {
    //verify and compare token
    const dbToken = await prisma.refreshToken.findFirst({
      where: { deviceId: token.deviceId },
    });
    if (!dbToken)
      return res.status(401).json({ message: "Invalid refresh token" });
    if (dbToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: dbToken?.id } });
      return res.status(401).json({ message: "Expired refresh token" });
    }

    const user = await prisma.user.findUnique({ where: { id: token.userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const tokenMatch = await bcrypt.compare(rawToken, dbToken.token);
    if (!tokenMatch) return res.status(401).json({ message: "Unauthorized" });

    //delete and issue new tokens
    await prisma.refreshToken.deleteMany({
      where: {
        deviceId: dbToken.deviceId,
      },
    });
    const accessToken = await issueTokens(user, res);

    return res.status(200).json({ accessToken, user });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Refresh token expired" });
    }
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}

export async function changePasswordAuthenticated(
  req: Request<{}, {}, { oldPassword?: string; newPassword?: string }>,
  res: Response,
  next: NextFunction,
) {
  const { oldPassword, newPassword } = req.body;
  const id = req.user?.id!;

  if (!oldPassword || !newPassword)
    return res.status(400).json({ message: "Password missing" });

  const validatedOld = loginSchema.shape.password.safeParse(oldPassword);
  const validatedNew = loginSchema.shape.password.safeParse(newPassword);

  //check message later could be wrong
  if (!validatedOld.success)
    return res.status(400).json({ message: validatedOld.error.message });
  if (!validatedNew.success)
    return res.status(400).json({ message: validatedNew.error.message });

  try {
    //check if user exists and and get hashed password
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    //logic for if oauth user has no password, just gets one
    if (!user.password) {
      //hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      //update password
        await prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
        include: {
          cart: true,
          orders: true,
        },
      });
      return res.status(200).json({message:"Password set successfully!" });
    }
    //compare old password with db hashed one

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    //hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //update password
      await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      include: {
        cart: true,
        orders: true,
      },
    });

    return res.status(200).json({message:"Password changed successfully!" });
  } catch (err) {
    next(err);
  }
}
