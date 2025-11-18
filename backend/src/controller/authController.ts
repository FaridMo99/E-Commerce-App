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
import { JWT_EMAIL_TOKEN_SECRET } from "../config/env.js";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";
import { userSelect } from "../config/prismaHelpers.js";


export async function login(
  req: Request<{}, {}, LoginSchema>,
  res: Response,
  next: NextFunction
) {
  const { email, password } = req.body;
  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Attempting login for email: ${email}`)
    );

    const user = await prisma.user.findFirst({where: { email }});

    if (!user) {
      console.log(
        chalk.red(
          `${getTimestamp()} Login failed for email: ${email} – user not found`
        )
      );
      return res.status(401).json({ message: "Email or Password is wrong" });
    }
    if (!user.verified) {
      console.log(user)
      console.log(
        chalk.yellow(
          `${getTimestamp()} Login attempt for unverified account: ${email}`
        )
      );
      return res.status(400).json({ message: "Account not verified yet" });
    }

    if (!user.password && user.createdBy !== "SELF") {
      const formattedOAuthProvider =
        user.createdBy.charAt(0).toUpperCase() +
        user.createdBy.slice(1).toLowerCase();
      console.log(
        chalk.yellow(
          `${getTimestamp()} OAuth login attempt for ${email} via ${formattedOAuthProvider}`
        )
      );
      return res.status(401).json({
        message: `You logged in last time with ${formattedOAuthProvider}. Please log in again with ${formattedOAuthProvider} and set a password in Account Settings to use this login.`,
      });
    }

    if (!user.password) {
      console.log(
        chalk.red(
          `${getTimestamp()} Login failed for email: ${email} – no password`
        )
      );
      return res.status(401).json({ message: "Email or Password is wrong" });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      console.log(
        chalk.red(
          `${getTimestamp()} Login failed for email: ${email} – wrong password`
        )
      );
      return res.status(401).json({ message: "Email or Password is wrong" });
    }

    const accessToken = await issueTokens(user, res);
    console.log(
      chalk.green(`${getTimestamp()} Login successful for email: ${email}`)
    );
    const safeUser = {
      name: user.name,
      role:user.role
    }
    return res.status(200).json({ accessToken, user:safeUser });
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Error during login for email: ${email}`),
      err
    );
    next(err);
  }
}

export async function signup(
  req: Request<{}, {}, SignupSchema>,
  res: Response,
  next: NextFunction
) {
  const { email } = req.body;
  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Signup attempt for email: ${email}`)
    );

    const emailExists = await prisma.user.findFirst({ where: { email } });
    if (emailExists) {
      console.log(
        chalk.red(
          `${getTimestamp()} Signup failed – email already in use: ${email}`
        )
      );
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: req.body.name,
        ...(req.body.birthdate && { birthdate: req.body.birthdate }),
        ...(req.body.address && { address: req.body.address }),
        password: await bcrypt.hash(req.body.password, 10),
        createdBy: "SELF",
        cart: { create: {} },
      },
    });

    const token = jwt.sign({ id: user.id }, JWT_EMAIL_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    await redis.setEx(`verifyToken:${user.id}`, 60 * 60 * 24, token);
    await sendVerificationEmail(user.email, "verify-success", token);

    console.log(
      chalk.green(`${getTimestamp()} Signup successful for email: ${email}`)
    );
    return res
      .status(201)
      .json({ message: "Signup successful, verify your Email." });
  } catch (err) {
    console.error(
      chalk.red(`${getTimestamp()} Error during signup for email: ${email}`),
      err
    );
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.refreshTokenPayload!;
    console.log(
      chalk.yellow(`${getTimestamp()} Logging out userId: ${token?.userId}`)
    );

    if (token) {
      await prisma.refreshToken.deleteMany({
        where: { deviceId: token.deviceId, userId: token.userId },
      });
    }

    res.clearCookie("refreshToken");

    res.clearCookie("csrfToken");

    console.log(
      chalk.green(
        `${getTimestamp()} Logout successful for userId: ${token?.userId}`
      )
    );
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.log(chalk.red(`${getTimestamp()} Error during logout`), err);
    next(err);
  }
}

export async function verifyUser(
  req: Request<{}, {}, { token: string | undefined }>,
  res: Response,
  next: NextFunction
) {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    console.log(chalk.yellow(`${getTimestamp()} Verifying user token`));

    const payload = jwt.verify(token, JWT_EMAIL_TOKEN_SECRET) as { id: string };
    const userId = payload.id;

    const storedToken = await redis.get(`verifyToken:${userId}`);
    if (!storedToken) {
      console.log(
        chalk.red(
          `${getTimestamp()} Token expired or already used for userId: ${userId}`
        )
      );
      return res.status(400).json({ message: "Token expired or already used" });
    }

    if (storedToken !== token) {
      console.log(
        chalk.red(`${getTimestamp()} Invalid token for userId: ${userId}`)
      );
      return res.status(400).json({ message: "Invalid token" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { verified: true },
    });

    await redis.del(`verifyToken:${userId}`);
    const accessToken = await issueTokens(user, res);

    console.log(
      chalk.green(
        `${getTimestamp()} User verified successfully: userId ${userId}`
      )
    );
        const safeUser = {
          name: user.name,
          role: user.role,
        };
    return res.status(200).json({ accessToken, user:safeUser });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      console.log(chalk.red(`${getTimestamp()} Verification token expired`));
      return res.status(400).json({ message: "Token expired" });
    }
    console.log(chalk.red(`${getTimestamp()} Error verifying user`), err);
    return next(err);
  }
}

export async function changePassword(
  req: Request<{}, {}, { password?: string; token?: string }>,
  res: Response,
  next: NextFunction
) {
  const { password, token } = req.body;
  console.log(
    chalk.yellow(`${getTimestamp()} changePassword called for token: ${token}`)
  );

  if (!password && !token)
    return res.status(400).json({ message: "Token and Password missing" });
  if (!password) return res.status(400).json({ message: "Password missing" });
  if (!token) return res.status(400).json({ message: "Token missing" });

  const validatedPassword = loginSchema.shape.password.safeParse(password);
  if (!validatedPassword.success)
    return res.status(400).json({ message: validatedPassword.error.message });

  try {
    const payload = jwt.verify(token, JWT_EMAIL_TOKEN_SECRET) as { id: string };
    const redisTokenKey = `changePasswordUserId:${payload.id}`;
    const redisToken = await redis.get(redisTokenKey);

    if (!redisToken) {
      console.log(
        chalk.red(
          `${getTimestamp()} Invalid or expired change password link for userId: ${payload.id}`
        )
      );
      return res.status(404).json({ message: "Invalid or expired Link" });
    }
    if (redisToken !== token) {
      console.log(
        chalk.red(
          `${getTimestamp()} Mismatched change password token for userId: ${payload.id}`
        )
      );
      return res.status(403).json({ message: "Invalid Link" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({
      where: { id: payload.id },
      data: { password: hashedPassword },
    });

    await redis.del(redisTokenKey);
    const accessToken = await issueTokens(user, res);

    console.log(
      chalk.green(
        `${getTimestamp()} Password changed successfully for userId: ${payload.id}`
      )
    );

    const safeUser = {
      name: user.name,
      role: user.role,
    };
    return res.status(200).json({ accessToken, user: safeUser });
  } catch (err) {
    console.log(chalk.red(`${getTimestamp()} Error in changePassword`), err);
    next(err);
  }
}

export async function sendNewVerifyLink(
  req: Request<{}, {}, { email: string }>,
  res: Response,
  next: NextFunction
) {
  const { email } = req.body;
  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Sending new verification link to email: ${email}`
      )
    );

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      console.log(chalk.red(`${getTimestamp()} User not found: ${email}`));
      return res.status(404).json({ message: "User not found" });
    }
    if (user.verified) {
      console.log(
        chalk.yellow(`${getTimestamp()} User already verified: ${email}`)
      );
      return res.status(400).json({ message: "User already verified" });
    }

    await redis.del(`verifyToken:${user.id}`);
    const token = jwt.sign({ id: user.id }, JWT_EMAIL_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    await redis.setEx(`verifyToken:${user.id}`, 60 * 60 * 24, token);

    await sendVerificationEmail(user.email, "verify-success", token);
    console.log(
      chalk.green(`${getTimestamp()} New verification link sent to ${email}`)
    );
    return res
      .status(201)
      .json({ message: "Sent new Link, check your Email." });
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Error sending new verification link to ${email}`
      ),
      err
    );
    next(err);
  }
}

export async function sendEmailToChangePassword(
  req: Request<{}, {}, { email: string }>,
  res: Response,
  next: NextFunction
) {
  const email = req.body.email;
  console.log(
    chalk.yellow(
      `${getTimestamp()} sendEmailToChangePassword called for email: ${email}`
    )
  );

  try {
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      console.log(chalk.red(`${getTimestamp()} User not found: ${email}`));
      return res
        .status(404)
        .json({ message: `User with E-Mail: ${email} does not exist.` });
    }

    const token = jwt.sign({ id: user.id }, JWT_EMAIL_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    await redis.del(`changePasswordUserId:${user.id}`);
    await redis.setEx(`changePasswordUserId:${user.id}`, 60 * 60 * 24, token);
    await sendVerificationEmail(email, "change-password", token);

    console.log(
      chalk.green(`${getTimestamp()} Change password email sent to: ${email}`)
    );
    return res.status(200).json({ message: "success" });
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Error sending change password email to: ${email}`
      ),
      err
    );
    next(err);
  }
}

export async function issueRefreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.refreshTokenPayload!;
  const rawToken = req.cookies.refreshToken as string;
  console.log(
    chalk.yellow(
      `${getTimestamp()} issueRefreshToken called for userId: ${token?.userId}`
    )
  );
  
  try {

    const dbToken = await prisma.refreshToken.findFirst({
      where: { deviceId: token.deviceId },
    });

    if (!dbToken)
      return res.status(401).json({ message: "Invalid refresh token" });

    if (dbToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: dbToken?.id } });
      return res.status(401).json({ message: "Expired refresh token" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: token.userId
      }
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const tokenMatch = await bcrypt.compare(rawToken, dbToken.token);
    if (!tokenMatch) return res.status(401).json({ message: "Unauthorized" });

    await prisma.refreshToken.deleteMany({
      where: { deviceId: dbToken.deviceId },
    });

    res.clearCookie("refreshToken");
    res.clearCookie("csrfToken");

    const accessToken = await issueTokens(user, res,token.deviceId);

    console.log(
      chalk.green(
        `${getTimestamp()} Refresh token issued successfully for userId: ${token.userId}`
      )
    );

    const safeUser = {
      name: user.name,
      role: user.role,
    };
    
    return res.status(200).json({ accessToken, user:safeUser });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      console.log(
        chalk.red(
          `${getTimestamp()} Refresh token expired for userId: ${token?.userId}`
        )
      );
      return res.status(401).json({ message: "Refresh token expired" });
    }
    console.error(
      chalk.red(
        `${getTimestamp()} Error issuing refresh token for userId: ${token?.userId}`
      ),
      err
    );
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}

export async function changePasswordAuthenticated(
  req: Request<{}, {}, { oldPassword?: string; newPassword?: string }>,
  res: Response,
  next: NextFunction
) {
  const { oldPassword, newPassword } = req.body;
  const id = req.user?.id!;
  console.log(
    chalk.yellow(
      `${getTimestamp()} changePasswordAuthenticated called for userId: ${id}`
    )
  );

  if (!oldPassword || !newPassword)
    return res.status(400).json({ message: "Password missing" });

  const validatedOld = loginSchema.shape.password.safeParse(oldPassword);
  const validatedNew = loginSchema.shape.password.safeParse(newPassword);

  if (!validatedOld.success)
    return res.status(400).json({ message: validatedOld.error.message });
  if (!validatedNew.success)
    return res.status(400).json({ message: validatedNew.error.message });

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.password) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
        include: { cart: true, orders: true },
      });
      console.log(
        chalk.green(
          `${getTimestamp()} Password set successfully for OAuth userId: ${id}`
        )
      );
      return res.status(200).json({ message: "Password set successfully!" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      console.log(
        chalk.red(
          `${getTimestamp()} Wrong old password provided by userId: ${id}`
        )
      );
      return res.status(400).json({ message: "Wrong password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const newUser = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: {
        ...userSelect
      }
    });

    console.log(
      chalk.green(
        `${getTimestamp()} Password changed successfully for userId: ${id}`
      )
    );
    return res.status(200).json({user});
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Error changing password for userId: ${id}`
      ),
      err
    );
    next(err);
  }
}