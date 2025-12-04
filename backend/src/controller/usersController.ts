import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import type {
  AddCartItemSchema,
  ItemQuantitySchema,
  OrdersQuerySchema,
  UpdateUserSchema,
} from "@monorepo/shared";
import type { User } from "../generated/prisma/client.js";
import { formatPriceForClient, transformAndFormatProductPrice } from "../lib/currencyHandlers.js";
import { deleteUserCart } from "../lib/controllerUtils.js";
import chalk from "chalk";
import { calculateCartTotals, getTimestamp } from "../lib/utils.js";
import {
  authenticatedReviewSelect,
  cartSelect,
  orderSelect,
  productSelect,
  productWhere,
  userAuthenticatedSelect,
} from "../config/prismaHelpers.js";

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
        id,
      },
      select: {
        ...userAuthenticatedSelect,
        password:true
      },
    });

    if (!user) {
      console.log(chalk.red(`${getTimestamp()} User ${id} not found`));
      return res.status(404).json({ message: "User not found" });
    }

    console.log(
      chalk.green(`${getTimestamp()} Fetched user ${id} successfully`)
    );
    user.hasPassword = !!user.password
    const {password, ...safeUser} = user
    return res.status(200).json(safeUser);
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
  const { name, birthdate, countryCode, currency, street, houseNumber, postalCode, city, state } = req.body;
  const id = req.user?.id;

  if (!id) {
    console.log(chalk.red(`${getTimestamp()} User not logged in`));
    return res.status(400).json({ message: "User not logged in" });
  }

  try {
    console.log(chalk.yellow(`${getTimestamp()} Updating user ${id}`));


    const data: Partial<User> = {
      ...(name && { name }),
      ...(birthdate && { birthdate }),
      ...(street && { street }),
      ...(houseNumber && { houseNumber }),
      ...(postalCode && { postalCode }),
      ...(city && { city }),
      ...(state && { state }),
      ...(currency && { currency }),
      ...(countryCode && { countryCode }),
    };

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        ...userAuthenticatedSelect,
        password:true
      }
    });

    console.log(
      chalk.green(`${getTimestamp()} User ${id} updated successfully`)
    );
    
        user.hasPassword = !!user.password;
        const { password, ...safeUser } = user;
        return res.status(200).json(safeUser);
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
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!
  const { sort, order, page, limit, status } = req.validatedQuery as OrdersQuerySchema;

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
        ...orderSelect,
      },
      orderBy: {
        [sort]: order,
      },
      ...(limit && page && { skip: (page - 1) * limit}),
      ...(page && {take: page}),
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
        user_id: userId,
      },
      select: {
        ...orderSelect,
      },
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
        user_id: userId,
      },
      select: {
        ...authenticatedReviewSelect,
      },
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
  const currency = req.currency!
  
  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Fetching cart for user ${userId}`)
    );
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
      },
      select: cartSelect
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

        await Promise.all(
          cart.items.map((item) =>
            transformAndFormatProductPrice(item.product, item.product.currency, currency)
          )
        );
    
    
    calculateCartTotals(cart)

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
  const userId = req.user?.id!;

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
  const userId = req.user!.id;
  const { productId, quantity } = req.body;
  const currency = req.currency!;

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Adding product ${productId} to cart for user ${userId}`
      )
    );

    //check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cart: { userId },
        productId,
      },
    });

    //check if amount in cart is more than available
    const product = await prisma.product.findUnique({ where: { id: productId } })

    if (!product) return res.status(404).json({ message: "Product not found" })
    if (quantity > product.stock_quantity)
      return res.status(400).json({ message: "Not enough stock" });
    if (
      existingItem &&
      existingItem.quantity + quantity > product.stock_quantity
    )
      return res.status(400).json({ message: "Total quantity exceeds stock" });

    let updatedCart;

    if (existingItem) {
      //update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });

      console.log(
        chalk.green(
          `${getTimestamp()} Increased quantity for ${productId} in cart for user ${userId}`
        )
      );
    } else {
      //create new item
      await prisma.cartItem.create({
        data: {
          cart: { connect: { userId } },
          product: { connect: { id: productId } },
          quantity,
        },
      });

      console.log(
        chalk.green(
          `${getTimestamp()} Product ${productId} added to cart for user ${userId}`
        )
      );
    }

    //return full updated cart
    updatedCart = await prisma.cart.findUnique({
      where: { userId },
      select: cartSelect
    });

    //convert and format prices
    await Promise.all(
      updatedCart!.items.map((item) =>
        transformAndFormatProductPrice(
          item.product,
          item.product.currency,
          currency
        )
      )
    );

    calculateCartTotals(updatedCart!);

    return res.status(200).json(updatedCart);
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
          select: cartSelect
        },
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
        `${getTimestamp()} Item ${itemId} removed successfully for user ${userId}`
      )
    );

    calculateCartTotals(cart.cart)
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
  const currency = req.currency!

  
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

    //check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cart: { userId },
        productId: itemId,
      },
    });

    //check if amount in cart is more than available
    const product = await prisma.product.findUnique({
      where: { id: itemId },
    });

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (quantity > product.stock_quantity)
      return res.status(400).json({ message: "Not enough stock" });
    if (
      existingItem &&
      existingItem.quantity + quantity > product.stock_quantity
    )
      return res.status(400).json({ message: "Total quantity exceeds stock" });

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
          select: cartSelect,
        },
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

    await Promise.all(
      cart.cart.items.map((item) =>
        transformAndFormatProductPrice(
          item.product,
          item.product.currency,
          currency
        )
      )
    );

    calculateCartTotals(cart.cart);

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
    const currency = req.currency!;

  
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
            ...productWhere,
          },
        },
      },
      select: {
        favorites: {
          select: {
            ...productSelect
          },
        },
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

    console.log(
      chalk.green(
        `${getTimestamp()} Successfully fetched favorite items for user ${userId}`
      )
    );

    await Promise.all(
      favorites.favorites.map((favorite) =>
        transformAndFormatProductPrice(
          favorite,
          favorite.currency,
          currency
        )
      )
    );    

    return res.status(200).json(favorites.favorites);
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
  const productId = req.body.productId
  const currency = req.currency!;


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
            id: productId,
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
      },
    });

    if (product) {
     await transformAndFormatProductPrice(product,product.currency,currency)
    }

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
  const currency = req.currency!;


  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Fetching recently viewed products for user ${userId}`
      )
    );
    const recentlyViewedProductsObj = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        recentlyViewedProducts: {
          where: {
            product: {
              ...productWhere, 
            },
          },
          select: {
            product: {
              select: { ...productSelect },
            },
          },
          orderBy: {
            viewedAt: "desc",
          },
          take:15
        },
      },
    });

    if (!recentlyViewedProductsObj) {
      console.log(
        chalk.red(
          `${getTimestamp()} No recently viewed products found for user ${userId}`
        )
      );
      return res.status(404).json({ message: "Favorite products not found" });
    }

    const recentlyViewedProducts =
      recentlyViewedProductsObj?.recentlyViewedProducts.map(
        (rv) => rv.product
      ) || [];


    console.log(
      chalk.green(
        `${getTimestamp()} Successfully fetched recently viewed products for user ${userId}`
      )
    );

    await Promise.all(
      recentlyViewedProducts.map((product) =>
        transformAndFormatProductPrice(
          product,
          product.currency,
          currency
        )
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

export async function addProductToRecentlyViewedProductsByProductId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id!;
  const productId = req.body.productId
  const currency = req.currency!


  if (!productId) return res.status(400).json({ message: "No Product provided" })
  
  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} adding product to recently viewed products for user ${userId}`
      )
    );

    const recentlyViewed = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        recentlyViewedProducts: {
          connectOrCreate: {
            where: {
              userId_productId: { userId, productId },
            },
            create: {
              product: { connect: { id: productId } },
            },
          },
        },
      },
      select: {
        recentlyViewedProducts: {
          where: {
            productId,
          },
          select: {
            product: {
              select: { ...productSelect },
            },
          },
        },
      },
    });


    console.log(
      chalk.green(
        `${getTimestamp()} Successfully added recently viewed product for user ${userId}`
      )
    );
    const product = recentlyViewed.recentlyViewedProducts[0]?.product;

    if (product) {
    await transformAndFormatProductPrice(product,product.currency, currency);  
    }

    return res.status(200).json(product);
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to add to recently viewed products for user ${userId}:`,
        err
      )
    );
    next(err);
  }
}