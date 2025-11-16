import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import type {
  AddCartItemSchema,
  ItemQuantitySchema,
  OrdersQuerySchema,
  UpdateUserSchema,
} from "@monorepo/shared";
import bcrypt from "bcrypt";
import type { User } from "../generated/prisma/client.js";
import type { JWTUserPayload } from "../types/types.js";
import { formatPriceForClient } from "../lib/currencyHandlers.js";
import { deleteUserCart } from "../lib/controllerUtils.js";

//update in all controllers what you return
export async function getUserByUserId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = req.user?.id;
  if (!id) return res.status(400).json({ message: "User not logged in" });

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateUserByUserId(
  req: Request<{}, {}, UpdateUserSchema>,
  res: Response,
  next: NextFunction,
) {
  const { email, name, password, birthdate, address } = req.body;
  const id = req.user?.id;

  if (!id) return res.status(400).json({ message: "User not logged in" });

  try {
    //check if email already exists
    if (email) {
      const emailInUse = await prisma.user.findFirst({ where: { email } });
      if (emailInUse)
        return res.status(400).json({ message: "Email already in use" });
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
        id,
      },
      data,
    });

    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export async function deleteUserByUserId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = req.user?.id;

  if (!id) return res.status(400).json({ message: "User not logged in" });

  try {
    const user = await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Delete successful" });
  } catch (err) {
    next(err);
  }
}

export async function getAllOrdersByUser(
  req: Request<{}, {}, {}, OrdersQuerySchema>,
  res: Response,
  next: NextFunction,
) {
  const userId = (req.user as JWTUserPayload).id;
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
    orders.forEach(
      (order) =>
        (order.total_amount = formatPriceForClient(order.total_amount)),
    );
    return res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
}

export async function getSingleOrderByUser(
  req: Request,
  res: Response,
  next: NextFunction,
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
    order.total_amount = formatPriceForClient(order.total_amount);
    return res.status(200).json(order);
  } catch (err) {
    next(err);
  }
}

export async function getReviewsByUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id!;

  try {
    const reviews = await prisma.review.findMany({
      where: {
        user_id: userId,
      },
    });
    return res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
}

//format cart product prices
export async function getUserCart(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id!;

  try {
    const cart = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        cart: {
          select: {
            items: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    return res.status(200).json(cart.cart);
  } catch (err) {
    next(err);
  }
}

export async function emptyCart(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id;

  try {
    const [_, cart] = await deleteUserCart(userId);

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    return res.status(200).json({ message: "Emptied successful" });
  } catch (err) {
    next(err);
  }
}

export async function addProductToUserCart(
  req: Request<{}, {}, AddCartItemSchema>,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id!;
  const { productId, quantity } = req.body;

  try {
    const newCartItem = await prisma.cartItem.create({
      data: {
        cart: { connect: { userId: userId } },
        product: { connect: { id: productId } },
        quantity,
      },
      select: {
        cart: true,
      },
    });

    return res.status(200).json(newCartItem.cart);
  } catch (err) {
    next(err);
  }
}

export async function removeProductFromUserCart(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id!;
  const itemId = req.params.itemId;

  if (!itemId)
    return res.status(400).json({ message: "No ProductId received" });

  try {
    const cart = await prisma.cartItem.delete({
      where: {
        cart: {
          userId,
        },
        id: itemId,
      },
      select: {
        cart: true,
      },
    });

    if (!cart) return res.status(404).json({ message: "Item not found" });

    return res.status(200).json(cart.cart);
  } catch (err) {
    next(err);
  }
}

//later give support for variants
export async function updateItemQuantity(
  req: Request<{ itemId: string }, {}, ItemQuantitySchema>,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id!;
  const itemId = req.params.itemId;
  const { quantity } = req.body;

  if (!itemId)
    return res.status(400).json({ message: "No ProductId received" });

  try {
    const cart = await prisma.cartItem.update({
      where: {
        cart: {
          userId,
        },
        id: itemId,
      },
      data: {
        quantity,
      },
      select: {
        cart: true,
      },
    });

    if (!cart) return res.status(404).json({ message: "Item not found" });

    return res.status(200).json(cart.cart);
  } catch (err) {
    next(err);
  }
}

//format favorite item prices
export async function getFavoriteItems(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id!;

  try {
    const favorites = await prisma.user.findUnique({
      where: {
        id: userId,
        favorites: {
          some: {
            is_public: true,
            deleted: false,
          },
        },
      },
      select: {
        favorites: true,
      },
    });
    if (!favorites)
      return res.status(404).json({ message: "Favorite products not found" });
    favorites.favorites.forEach((favorite) => {
      favorite.price = formatPriceForClient(favorite.price);
      if (favorite.sale_price) {
        favorite.sale_price = formatPriceForClient(favorite.sale_price);
      }
    });
    return res.status(200).json(favorites);
  } catch (err) {
    next(err);
  }
}

export async function deleteFavoriteItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id!;
  const productId = req.params.productId;
  if (!productId)
    return res.status(400).json({ message: "No product provided" });

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        favorites: {
          disconnect: { id: productId },
        },
      },
      include: { favorites: true },
    });

    if (!user) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ message: "Deleted item successful" });
  } catch (err) {
    next(err);
  }
}

export async function addFavoriteItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id!;
  const productId = req.body.productId as string;

  try {
    const product = await prisma.user.update({
      where: { id: userId },
      data: {
        favorites: {
          connect: { id: productId },
        },
      },
      include: {
        favorites: true,
      },
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    return res.status(200).json(product);
  } catch (err) {
    next(err);
  }
}

//format prices
export async function getRecentlyViewedProducts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id!;

  try {
    const recentlyViewedProducts = await prisma.user.findUnique({
      where: {
        id: userId,
        recentlyViewedProducts: {
          some: {
            product: {
              is_public: true,
              deleted: false,
            },
          },
        },
      },
      select: {
        recentlyViewedProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!recentlyViewedProducts)
      return res.status(404).json({ message: "Favorite products not found" });
    recentlyViewedProducts.recentlyViewedProducts.forEach((product) => {
      product.product.price = formatPriceForClient(product.product.price);
      if (product.product.sale_price) {
        product.product.sale_price = formatPriceForClient(
          product.product.sale_price,
        );
      }
    });
    return res.status(200).json(recentlyViewedProducts);
  } catch (err) {
    next(err);
  }
}
