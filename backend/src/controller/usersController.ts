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
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";
import { authenticatedReviewSelect, cartSelect, orderSelect, productSelect, productWhere, reviewSelect, userSelect } from "../config/prismaHelpers.js";

// Get user by ID
export async function getUserByUserId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = req.user?.id;
  if (!id) {
    console.log(chalk.red(`${getTimestamp()} User not logged in`));
    return res.status(400).json({ message: "User not logged in" });
  }

  try {
    console.log(chalk.yellow(`${getTimestamp()} Fetching user ${id}`));

    const user = await prisma.user.findUnique({
      where: {
        id
      },
      select: {
        ...userSelect
      }
    });

    if (!user) {
      console.log(chalk.red(`${getTimestamp()} User ${id} not found`));
      return res.status(404).json({ message: "User not found" });
    }

    console.log(
      chalk.green(`${getTimestamp()} Fetched user ${id} successfully`)
    );
    return res.status(200).json(user);
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to fetch user ${id}:`, err)
    );
    next(err);
  }
}

// Update user by ID
export async function updateUserByUserId(
  req: Request<{}, {}, UpdateUserSchema>,
  res: Response,
  next: NextFunction
) {
  const { email, name, password, birthdate, address } = req.body;
  const id = req.user?.id;

  if (!id) {
    console.log(chalk.red(`${getTimestamp()} User not logged in`));
    return res.status(400).json({ message: "User not logged in" });
  }

  try {
    console.log(chalk.yellow(`${getTimestamp()} Updating user ${id}`));

    if (email) {
      const emailInUse = await prisma.user.findFirst({ where: { email } });
      if (emailInUse) {
        console.log(
          chalk.red(`${getTimestamp()} Email ${email} already in use`)
        );
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const data: Partial<User> = {
      ...(email && { email }),
      ...(name && { name }),
      ...(birthdate && { birthdate }),
      ...(address && { address }),
      ...(password && { password: await bcrypt.hash(password, 10) }),
    };

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        ...userSelect
      }
    });

    console.log(
      chalk.green(`${getTimestamp()} User ${id} updated successfully`)
    );
    return res.status(200).json(user);
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to update user ${id}:`, err)
    );
    next(err);
  }
}

// Delete user by ID
export async function deleteUserByUserId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = req.user?.id;

  if (!id) {
    console.log(chalk.red(`${getTimestamp()} User not logged in`));
    return res.status(400).json({ message: "User not logged in" });
  }

  try {
    console.log(chalk.yellow(`${getTimestamp()} Deleting user ${id}`));
    await prisma.user.delete({ where: { id } });
    console.log(
      chalk.green(`${getTimestamp()} User ${id} deleted successfully`)
    );
    return res.status(200).json({ message: "Delete successful" });
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to delete user ${id}:`, err)
    );
    next(err);
  }
}

// Get all orders by user
export async function getAllOrdersByUser(
  req: Request<{}, {}, {}, OrdersQuerySchema>,
  res: Response,
  next: NextFunction
) {
  const userId = (req.user as JWTUserPayload).id;
  const { sort, order, page, limit, status } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (!userId) {
    console.log(chalk.red(`${getTimestamp()} User not authenticated`));
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Fetching orders for user ${userId}`)
    );
    const orders = await prisma.order.findMany({
      where: {
        user_id: userId,
        ...(status ? { status } : {}),
      },
      select: {
        ...orderSelect
      },
      orderBy: {
        [sort]: order,
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });

    orders.forEach(
      (order) => (order.total_amount = formatPriceForClient(order.total_amount))
    );

    console.log(
      chalk.green(
        `${getTimestamp()} Orders fetched successfully for user ${userId}`
      )
    );
    return res.status(200).json(orders);
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to fetch orders for user ${userId}:`,
        err
      )
    );
    next(err);
  }
}

// Get single order by user
export async function getSingleOrderByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;
  const orderId = req.params.orderId!;
  if (!userId) {
    console.log(chalk.red(`${getTimestamp()} User not authenticated`));
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Fetching order ${orderId} for user ${userId}`
      )
    );
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user_id: userId
      },
      select: {
        ...orderSelect
      }
    });

    if (!order) {
      console.log(
        chalk.red(
          `${getTimestamp()} Order ${orderId} not found for user ${userId}`
        )
      );
      return res.status(404).json({ message: "Order not found" });
    }

    order.total_amount = formatPriceForClient(order.total_amount);
    console.log(
      chalk.green(
        `${getTimestamp()} Order ${orderId} fetched successfully for user ${userId}`
      )
    );
    return res.status(200).json(order);
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to fetch order ${orderId} for user ${userId}:`,
        err
      )
    );
    next(err);
  }
}

// Get reviews by user
export async function getReviewsByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!;

  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Fetching reviews for user ${userId}`)
    );
    const reviews = await prisma.review.findMany({
      where: {
        user_id: userId
      },
      select: {
        ...authenticatedReviewSelect
      }
    });
    console.log(
      chalk.green(
        `${getTimestamp()} Reviews fetched successfully for user ${userId}`
      )
    );
    return res.status(200).json(reviews);
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to fetch reviews for user ${userId}:`,
        err
      )
    );
    next(err);
  }
}

// Get user cart
export async function getUserCart(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!;

  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Fetching cart for user ${userId}`)
    );
    const cart = await prisma.cart.findFirst({
      where: {
        userId
      },
      select: {
        ...cartSelect
      }
    });

    if (!cart) {
      console.log(
        chalk.red(`${getTimestamp()} Cart not found for user ${userId}`)
      );
      return res.status(404).json({ message: "Cart not found" });
    }

    console.log(
      chalk.green(
        `${getTimestamp()} Cart fetched successfully for user ${userId}`
      )
    );
    return res.status(200).json(cart);
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to fetch cart for user ${userId}:`,
        err
      )
    );
    next(err);
  }
}

// Empty user cart
export async function emptyCart(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;

  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Emptying cart for user ${userId}`)
    );
    const [_, cart] = await deleteUserCart(userId);

    if (!cart) {
      console.log(
        chalk.red(`${getTimestamp()} Cart not found for user ${userId}`)
      );
      return res.status(404).json({ message: "Cart not found" });
    }

    console.log(
      chalk.green(
        `${getTimestamp()} Cart emptied successfully for user ${userId}`
      )
    );
    return res.status(200).json({ message: "Emptied successful" });
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to empty cart for user ${userId}:`,
        err
      )
    );
    next(err);
  }
}

// Add product to user cart
export async function addProductToUserCart(
  req: Request<{}, {}, AddCartItemSchema>,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!;
  const { productId, quantity } = req.body;

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Adding product ${productId} to cart for user ${userId}`
      )
    );
    const newCartItem = await prisma.cartItem.create({
      data: {
        cart: { connect: { userId } },
        product: { connect: { id: productId } },
        quantity,
      },
      select: {
        cart: {
          select: {
          ...cartSelect
        }
      } },
    });

    console.log(
      chalk.green(
        `${getTimestamp()} Product ${productId} added to cart successfully for user ${userId}`
      )
    );
    return res.status(200).json(newCartItem.cart);
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to add product ${productId} to cart for user ${userId}:`,
        err
      )
    );
    next(err);
  }
}

// Remove product from user cart
export async function removeProductFromUserCart(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!;
  const itemId = req.params.itemId;

  if (!itemId) {
    console.log(
      chalk.red(`${getTimestamp()} No ProductId received for removal`)
    );
    return res.status(400).json({ message: "No ProductId received" });
  }

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Removing item ${itemId} from cart for user ${userId}`
      )
    );
    const cart = await prisma.cartItem.delete({
      where: { cart: { userId }, id: itemId },
      select: {
        cart: {
          select: {
          ...cartSelect
        }
      } },
    });

    if (!cart) {
      console.log(
        chalk.red(
          `${getTimestamp()} Item ${itemId} not found for user ${userId}`
        )
      );
      return res.status(404).json({ message: "Item not found" });
    }

    console.log(
      chalk.green(
        `${getTimestamp()} Item ${itemId} removed successfully for user ${userId}`
      )
    );
    return res.status(200).json(cart.cart);
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to remove item ${itemId} from cart for user ${userId}:`,
        err
      )
    );
    next(err);
  }
}

//later give support for variants
export async function updateItemQuantity(
  req: Request<{ itemId: string }, {}, ItemQuantitySchema>,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!;
  const itemId = req.params.itemId;
  const { quantity } = req.body;

  if (!itemId) {
    console.log(chalk.red(`${getTimestamp()} No ProductId received`));
    return res.status(400).json({ message: "No ProductId received" });
  }

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Updating quantity for item ${itemId}, user ${userId}`
      )
    );
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
        cart: {
          select: {
            ...cartSelect
          }
        }
      },
    });

    if (!cart) {
      console.log(
        chalk.red(
          `${getTimestamp()} Item ${itemId} not found for user ${userId}`
        )
      );
      return res.status(404).json({ message: "Item not found" });
    }

    console.log(
      chalk.green(
        `${getTimestamp()} Quantity updated for item ${itemId}, user ${userId}`
      )
    );
    return res.status(200).json(cart.cart);
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to update quantity for item ${itemId}, user ${userId}:`,
        err
      )
    );
    next(err);
  }
}

// Get favorite items and format prices
export async function getFavoriteItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!;
  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Fetching favorite items for user ${userId}`
      )
    );
    const favorites = await prisma.user.findUnique({
      where: {
        id: userId,
        favorites: {
          some: {
            ...productWhere
          },
        },
      },
      select: {
        favorites: {
          select: {
            ...productSelect
          }
        }
      },
    });

    if (!favorites) {
      console.log(
        chalk.red(
          `${getTimestamp()} No favorite products found for user ${userId}`
        )
      );
      return res.status(404).json({ message: "Favorite products not found" });
    }

    favorites.favorites.forEach((favorite) => {
      favorite.price = formatPriceForClient(favorite.price);
      if (favorite.sale_price) {
        favorite.sale_price = formatPriceForClient(favorite.sale_price);
      }
    });

    console.log(
      chalk.green(
        `${getTimestamp()} Successfully fetched favorite items for user ${userId}`
      )
    );
    return res.status(200).json(favorites);
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to fetch favorite items for user ${userId}:`,
        err
      )
    );
    next(err);
  }
}

// Delete a favorite item
export async function deleteFavoriteItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!;
  const productId = req.params.productId;
  if (!productId) {
    console.log(
      chalk.red(`${getTimestamp()} No product provided for deletion`)
    );
    return res.status(400).json({ message: "No product provided" });
  }

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Deleting favorite product ${productId} for user ${userId}`
      )
    );
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        favorites: {
          disconnect: { id: productId },
        },
      },
      include: { favorites: true },
    });

    if (!user) {
      console.log(
        chalk.red(
          `${getTimestamp()} Product ${productId} not found for user ${userId}`
        )
      );
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(
      chalk.green(
        `${getTimestamp()} Successfully deleted favorite product ${productId} for user ${userId}`
      )
    );
    return res.status(200).json({ message: "Deleted item successful" });
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to delete favorite product ${productId} for user ${userId}:`,
        err
      )
    );
    next(err);
  }
}

// Add a favorite item
export async function addFavoriteItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!;
  const productId = req.body.productId as string;

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Adding favorite product ${productId} for user ${userId}`
      )
    );
    const response = await prisma.user.update({
      where: { id: userId },
      data: {
        favorites: {
          connect: {
            id: productId
          },
        },
      },
      include: {
        favorites: true,
      },
    });

    if (!response) {
      console.log(
        chalk.red(
          `${getTimestamp()} Product ${productId} not found for user ${userId}`
        )
      );
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(
      chalk.green(
        `${getTimestamp()} Successfully added favorite product ${productId} for user ${userId}`
      )
    );

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        ...productSelect
      }
    })

    return res.status(200).json(product);
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to add favorite product ${productId} for user ${userId}:`,
        err
      )
    );
    next(err);
  }
}

// Get recently viewed products and format prices
export async function getRecentlyViewedProducts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!;

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Fetching recently viewed products for user ${userId}`
      )
    );
    const recentlyViewedProducts = await prisma.user.findUnique({
      where: {
        id: userId,
        recentlyViewedProducts: {
          some: {
            product: {
              ...productWhere
            },
          },
        },
      },
      select: {
        recentlyViewedProducts: {
          select: {
            product: {
              select: {
                ...productSelect
              }
            }
          }
        },
      },
    });

    if (!recentlyViewedProducts) {
      console.log(
        chalk.red(
          `${getTimestamp()} No recently viewed products found for user ${userId}`
        )
      );
      return res.status(404).json({ message: "Favorite products not found" });
    }

    recentlyViewedProducts.recentlyViewedProducts.forEach((product) => {
      product.product.price = formatPriceForClient(product.product.price);
      if (product.product.sale_price) {
        product.product.sale_price = formatPriceForClient(
          product.product.sale_price
        );
      }
    });

    console.log(
      chalk.green(
        `${getTimestamp()} Successfully fetched recently viewed products for user ${userId}`
      )
    );
    return res.status(200).json(recentlyViewedProducts);
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to fetch recently viewed products for user ${userId}:`,
        err
      )
    );
    next(err);
  }
}