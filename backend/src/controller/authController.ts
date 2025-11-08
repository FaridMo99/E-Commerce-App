import type { Request, Response, NextFunction } from "express";
import { loginSchema, type LoginSchema, type SignupSchema } from "@monorepo/shared";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../services/prisma.js";
import redis from "../services/redis.js";
import { sendVerificationEmail } from "../services/email.js";


export async function login(req: Request<{}, {},LoginSchema>, res: Response, next: NextFunction) {
  const {email, password} = req.body
  try {
    
    //fix the return of cart products and orders, rn sending too much, also for verify user
    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        cart: true,
        orders:true
      }
    })

    if(!user) return res.status(404).json({message:"Email or Password is wrong"})
    if (!user.verified) return res.status(400).json({ message: "Not verified yet" })
    
    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) return res.status(404).json({ message: "Email or Password is wrong" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "30min" })
    
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "dev",
      sameSite: "strict",
      maxAge: 1000 * 60 * 30,
    });

    return res.status(200).json({name:user.name,cart:user.cart, orders:user.orders})
  } catch (err) {
    next(err)
  }
}

export async function signup(req: Request<{}, {}, SignupSchema>, res: Response, next: NextFunction) {
  const { email, password, name, birthdate, address } = req.body
  try {
    //check if email already exists
    const emailExists = await prisma.user.findFirst({ where: { email } })
    if (emailExists) return res.status(400).json({ message: "Email already in use" })
    
    //create user
      const user = await prisma.user.create({
      data: {
        email,
        name,
        birthdate,
        address,
        password: await bcrypt.hash(password,10)
      }
      })
    
    //send email to verify, token only valid 24 hours
    const token = jwt.sign({id:user.id},process.env.JWT_EMAIL_SECRET!,{expiresIn:"1d"})
    await redis.setEx(`verifyToken:${user.id}`,60*60*24, token)

    await sendVerificationEmail(user.email, "verify-success",token)
    return res.status(201).json({message:"Signup successful, verify your Email."})
  } catch (err) {
    next(err)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "dev",
      expires: new Date(0),
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
}


//trigger login after success
export async function verifyUser(
  req: Request<{}, {}, { token: string | undefined }>,
  res: Response,
  next: NextFunction
) {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    //Verify JWT signature
    const payload = jwt.verify(token, process.env.JWT_EMAIL_SECRET!) as {
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
        orders:true
      }
    });

    //Delete token from Redis
    await redis.del(`verifyToken:${userId}`);

    //create token for logging in
    const authToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "30min" }
    );

    res.cookie("jwt", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "dev",
      sameSite: "strict",
      maxAge: 1000 * 60 * 30,
    });

    return res
      .status(200)
      .json({ name: user.name, cart: user.cart, orders: user.orders });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ message: "Token expired" });
    }
    return next(err);
  }
}

export async function sendNewVerifyLink(req: Request<{}, {}, { email: string }>, res: Response, next: NextFunction) {
  
  const { email } = req.body
  
  try {
    const user = await prisma.user.findFirst({
    where:{email}
    })
    if (!user) return res.status(404).json({ message: "User not found" })
    if (user.verified) return res.status(400).json({ message: "User already verified" })
    
    await redis.del(`verifyToken:${user.id}`);
    const token = jwt.sign({ id: user.id }, process.env.JWT_EMAIL_SECRET!, {
      expiresIn: "1d",
    });
    await redis.setEx(`verifyToken:${user.id}`, 60 * 60 * 24, token);

    await sendVerificationEmail(user.email, "verify-success", token);
    return res.status(201).json({ message: "Sent new Link, check your Email." });

  } catch (err) {
    next(err)
  }
}

export async function changePassword(req: Request<{}, {}, { password?: string, token?:string }>, res: Response, next: NextFunction) {
  const { password, token } = req.body

  if (!password || !token) return res.status(400).json({ message: "Password missing" })
  
  const validatedPassword = loginSchema.shape.password.safeParse(password)
  //change the messsage later, could be wrong
  if (!validatedPassword.success) return res.status(400).json({ message: validatedPassword.error.message })
  
  try {

      const payload = jwt.verify(token, process.env.JWT_EMAIL_SECRET!) as {
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
          where: { id:payload.id },
          data: { password: hashedPassword },
          include: {
            cart: true,
            orders:true
          }
        })

        const authToken = jwt.sign(
          { id: user.id, role: user.role },
          process.env.JWT_SECRET!,
          { expiresIn: "30min" }
        );

        res.cookie("jwt", authToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== "dev",
          sameSite: "strict",
          maxAge: 1000 * 60 * 30,
        });

        await redis.del(redisTokenKey);

        return res
          .status(200)
          .json({ name: user.name, cart: user.cart, orders: user.orders });

  } catch (err) {
    next(err)
  }
  
}

export async function sendEmailToChangePassword(req: Request<{}, {}, { email: string }>, res: Response, next: NextFunction) {
  const email = req.body.email
  
  try {
    const user = await prisma.user.findFirst({where: { email }});

    if (!user) return res.status(404).json({ message: `User with E-Mail: ${email} does not exist.` });

    const token = jwt.sign({ id: user.id }, process.env.JWT_EMAIL_SECRET!, {expiresIn: "1d"});
    
    await redis.setEx(`changePasswordUserId:${user.id}`, 60*60*24, token);

    await sendVerificationEmail(email,"change-password",token);

    return res.status(200).json({ message: "success" });
  } catch (err) {
    next(err);
  }

}
 
//add refresh token to stay logged in
//add csrf token to avoid csrf
//extract duplicate stuff like issuing tokens, verifying etc. to util fns