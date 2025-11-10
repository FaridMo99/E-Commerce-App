import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import type { OrdersQuerySchema, UpdateUserSchema } from "@monorepo/shared";
import bcrypt from "bcrypt"
import type { User } from "../generated/prisma/client.js";

//update in all controllers what you return
export async function getUserByUserId(req: Request, res: Response, next: NextFunction) {
    const id = req.user?.id
    if (!id) return res.status(400).json({ message: "User not logged in" })
    
    try {
        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) return res.status(404).json({ message: "User not found" })
        
        return res.status(200).json(user)
    } catch (err) {
        next(err)
    }
}

export async function updateUserByUserId(req: Request<{}, {}, UpdateUserSchema>, res: Response, next: NextFunction) {
    const { email, name, password, birthdate, address } = req.body
    const id = req.user?.id

    if (!id) return res.status(400).json({ message: "User not logged in" })

    try {
        //check if email already exists
        if (email) {
            const emailInUse = await prisma.user.findFirst({ where: { email } })
            if(emailInUse) return res.status(400).json({message:"Email already in use"})
        }
        
            const data: Partial<User> = {
              ...(email && { email }),
              ...(name && { name }),
              ...(birthdate && { birthdate }),
              ...(address && { address }),
              ...(password && { password: await bcrypt.hash(password, 10) }),
            };
        
        const user = await prisma.user.update({
            where: {
                id
            },
            data
        })

        return res.status(200).json(user)
    } catch (err) {
        next(err)
    }
}

export async function deleteUserByUserId(req: Request, res: Response, next: NextFunction) {
        const id = req.user?.id;

        if (!id) return res.status(400).json({ message: "User not logged in" });

    try {
        const user = await prisma.user.delete({
            where:{id}
        })

        return res.status(200).json({message:"Delete successful"})
    } catch (err) {
        next(err)
    }
}

export async function getAllOrdersByUser(
  req: Request<{}, {}, {}, OrdersQuerySchema>,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;
  const { sort, order, page, limit, status } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (!userId) return res.status(401).json({ message: "Not authenticated" });

  try {
    const orders = await prisma.order.findMany({
      where: {
        user_id: userId,
        ...(status ? { status } : {}),
      },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        [sort]: order,
      },

      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });
    return res.status(200).json(orders)
  } catch (err) {
    next(err);
  }
}

export async function getSingleOrderByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;
  const orderId = req.params.orderId!;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user_id: userId,
      },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.status(200).json(order);
  } catch (err) {
    next(err);
  }
}

export async function getReviewsByUser(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.id!

  try {
    const reviews = await prisma.review.findMany({
      where: {
        user_id:userId
      }
    })
    return res.status(200).json(reviews)
  } catch (err) {
    next(err)
  }
}

export async function getUserCart(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.id!

  try {
    const cart = await prisma.user.findUnique({
      where: { id: userId },
      select:{cart:true}
    })
    if (!cart) return res.status(404).json({message:"Cart not found"})
    
    return res.status(200).json(cart.cart)
    
  } catch (err) {
    next(err)
  }
}

//finish this
export async function addProductToUserCart(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!;
  const {productId, amount} = req.body.product

  //make it support product quantity
  try {
    const cart = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        cart: {
          connect: {
            id: productId,
          }
        }
      },
      select: {
        cart: true
      }
    });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    return res.status(200).json(cart.cart);
  } catch (err) {
    next(err);
  }
}

export async function deleteCart(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!;

  try {
    const cart = await prisma.user.delete({
      where: {
        id: userId,
      },
      select: {
        cart: true,
      },
    });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    return res.status(200).json(cart.cart);
  } catch (err) {
    next(err);
  }
}

//finish this
export async function updateCart(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!;

}