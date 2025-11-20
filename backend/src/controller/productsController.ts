import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import {
  type ProductSchema,
  type ProductsQuerySchema,
  type ReviewSchema,
  type UpdateProductSchema,
} from "@monorepo/shared";
import { deleteCloudAsset, handleCloudUpload } from "../services/cloud.js";
import {
  formatPricesForClientAndCalculateAverageRating,
} from "../lib/currencyHandlers.js";
import type { CurrencyISO } from "../generated/prisma/enums.js";
import {
  BASE_CURRENCY_KEY,
  NEW_PRODUCTS_REDIS_KEY,
  SALE_PRODUCTS_REDIS_KEY,
} from "../config/constants.js";
import {
  getCategoryProducts,
  getNewProducts,
  getSaleProducts,
  getTrendingProducts,
} from "../lib/productQueries.js";
import redis from "../services/redis.js";
import type { Product } from "../generated/prisma/client.js";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";
import {
  productSelect,
  productSelector,
  productWhere,
  reviewSelect,
  reviewWhere,
} from "../config/prismaHelpers.js";

export async function getAllProducts(
  req: Request<{}, {}, {}, ProductsQuerySchema>,
  res: Response,
  next: NextFunction
) {
  const role = req.user?.role;
  const {
    search,
    category,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    page,
    limit,
    sale,
  } = req.query;

  const currency = req.currency!
  const priceField = `price_in_${currency}` as keyof typeof productSelect;
  const salePriceField = `sale_price_in_${currency}` as keyof typeof productSelect;
  
  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Fetching all products for role ${role || "guest"}`
      )
    );

    const products = await prisma.product.findMany({
      where: {
        ...(role !== "ADMIN" && { is_public: true }),
        deleted: false,
        ...(search && { name: { startsWith: search, mode: "insensitive" } }),
        ...(category && { category: { name: category } }),
        ...(sale && { [salePriceField]:{not:null} }),
        ...(minPrice || maxPrice
          ? {
              [priceField]: {
                ...(minPrice && { gte: minPrice }),
                ...(maxPrice && { lte: maxPrice }),
              },
            }
          : {}),
      },
      ...(sortBy && sortOrder && { orderBy: { [sortBy]: sortOrder } }),
      ...(limit && { take: limit }),
      ...(page && limit && { skip: (page - 1) * limit }),
      select: {
        ...productSelector(currency)
      },
    });

    console.log(
      chalk.green(`${getTimestamp()} Retrieved ${products.length} products`)
    );

    //format price from cent to .niceprice
    products.forEach(product => {
      formatPricesForClientAndCalculateAverageRating(product, priceField, salePriceField)
    })

    console.log(chalk.green(`${getTimestamp()} Products fetched successfully`));
    return res.status(200).json(products);
  } catch (err) {
    console.log(chalk.red(`${getTimestamp()} Failed to fetch products:`, err));
    next(err);
  }
}

//take your time with this one
export async function createProduct(
  req: Request<{}, {}, ProductSchema>,
  res: Response,
  next: NextFunction
) {
  const product = req.body;
  const images = req.files;

  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Creating product ${product.name}`)
    );

    let imageUrls: string[] | undefined;
    if (images && Array.isArray(images)) {
      const results = await Promise.all(
        images.map((image) => handleCloudUpload(image))
      );
      imageUrls = results.map((result) => result.secure_url);
      console.log(
        chalk.green(`${getTimestamp()} Uploaded ${imageUrls.length} images`)
      );
    }

    const newProduct = await prisma.$transaction(async (tx) => {
      const currency = await tx.settings.findFirst({
        where: { key: BASE_CURRENCY_KEY },
      });

      if (!currency) throw new Error("Base currency not found");

      const priceField = `price_in_${currency.value}` as keyof typeof productSelect;

      return tx.product.create({
        data: {
          name: product.name,
          ...(imageUrls && { imageUrls: [...imageUrls] }),
          [priceField]: product.price,
          currency: currency.value as CurrencyISO,
          description: product.description,
          stock_quantity: product.stock_quantity,
          is_public: product.is_public,
          ...(product.is_public && { published_at: new Date() }),
          category: { connect: { name: product.category } },
        },
        select: {
          ...productSelector(currency.value as CurrencyISO),
        },
      });
    });

    await Promise.all([
      redis.del(`category:${product.category}`),
      redis.del(NEW_PRODUCTS_REDIS_KEY),
      ...(newProduct.sale_price ? [redis.del(SALE_PRODUCTS_REDIS_KEY)] : []),
    ]);

    console.log(
      chalk.green(
        `${getTimestamp()} Product ${product.name} created successfully`
      )
    );
    return res.status(201).json(newProduct);
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to create product ${product.name}:`,
        err
      )
    );
    next(err);
  }
}

export async function getProductByProductId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = req.params.productId!;
  const currency = req.currency!

  const priceField = `price_in_${currency}` as keyof typeof productSelect;
  const salePriceField = `sale_price_in_${currency}` as keyof typeof productSelect;

  try {
    console.log(chalk.yellow(`${getTimestamp()} Fetching product ${id}`));

    const product = await prisma.product.findUnique({
      where: { ...productWhere, id },
      select: {
        ...productSelector(currency),
      },
    });

    if (!product) {
      console.log(chalk.red(`${getTimestamp()} Product ${id} not found`));
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(
      chalk.green(`${getTimestamp()} Product ${id} fetched successfully`)
    );

    //format price to nice price
    formatPricesForClientAndCalculateAverageRating(product,priceField, salePriceField)

    return res.status(200).json(product);
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to fetch product ${id}:`, err)
    );
    next(err);
  }
}

// Delete a product
export async function deleteProductByProductId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = req.params.productId!;

  try {
    console.log(chalk.yellow(`${getTimestamp()} Deleting product ${id}`));

    const preProduct = await prisma.product.findUnique({ where: { id } });
    if (!preProduct) {
      console.log(chalk.red(`${getTimestamp()} Product ${id} not found`));
      return res.status(404).json({ message: "Product not found" });
    }

    const imagesToDelete = preProduct.imageUrls.slice(1);
    if (imagesToDelete.length > 0) {
      console.log(
        chalk.yellow(
          `${getTimestamp()} Deleting ${imagesToDelete.length} cloud images for product ${id}`
        )
      );
      await Promise.all(imagesToDelete.map((url) => deleteCloudAsset(url)));
    }

    await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: { deleted: true, imageUrls: preProduct.imageUrls.slice(0, 1) },
      });

      await tx.product.update({
        where: { id },
        data: { favoredBy: { set: [] } },
      });

      await tx.cartItem.deleteMany({ where: { productId: id } });
      await tx.recentlyViewed.deleteMany({ where: { productId: id } });

      return updatedProduct;
    });

    console.log(
      chalk.green(`${getTimestamp()} Product ${id} deleted successfully`)
    );
    return res.status(200).json({ message: "Product successfully deleted" });
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to delete product ${id}:`, err)
    );
    next(err);
  }
}

//take your time with this one
// Update a product
export async function updateProductByProductId(
  req: Request<{ productId: string }, {}, UpdateProductSchema>,
  res: Response,
  next: NextFunction
) {
  const id = req.params.productId;
  const {
    name,
    description,
    price,
    stock_quantity,
    is_public,
    category,
    sale_price,
  } = req.body;

  const currency = req.currency!
  
  try {
    console.log(chalk.yellow(`${getTimestamp()} Updating product ${id}`));

    const product = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(price && { price }),
          ...(stock_quantity && { stock_quantity }),
          ...(typeof is_public === "boolean" && { is_public }),
          ...(is_public === true && { published_at: new Date() }),
          ...(sale_price && { sale_price }),
          ...(category && { category: { connect: { name: category } } }),
          updated_at: new Date(),
        },
        select: {
          ...productSelector(currency),
        },
      });

      if (is_public === false) {
        await tx.product.update({
          where: { id },
          data: { favoredBy: { set: [] } },
        });
        await tx.cartItem.deleteMany({ where: { productId: id } });
      }

      await tx.recentlyViewed.deleteMany({ where: { productId: id } });

      return updatedProduct;
    });

    if (!product) {
      console.log(chalk.red(`${getTimestamp()} Product ${id} not found`));
      return res.status(404).json({ message: "Product not found" });
    }

    if (is_public) {
      await Promise.all([
        redis.del(NEW_PRODUCTS_REDIS_KEY),
        ...(sale_price ? [redis.del(SALE_PRODUCTS_REDIS_KEY)] : []),
      ]);
    }

    //format and calc avg

    console.log(
      chalk.green(`${getTimestamp()} Product ${id} updated successfully`)
    );

    return res.status(200).json(product);
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to update product ${id}:`, err)
    );
    next(err);
  }
}

// Get all reviews for a product
export async function getAllReviewsByProductId(
  req: Request<{ productId: string }>,
  res: Response,
  next: NextFunction
) {
  const productId = req.params.productId;

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Fetching reviews for product ${productId}`
      )
    );
    const reviews = await prisma.review.findMany({
      where: {
        product_id: productId,
        ...reviewWhere,
      },
      select: {
        ...reviewSelect,
      },
    });

    console.log(
      chalk.green(`${getTimestamp()} Reviews fetched for product ${productId}`)
    );
    return res.status(200).json(reviews);
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to fetch reviews for product ${productId}:`,
        err
      )
    );
    next(err);
  }
}

// Create a review for a product
export async function createReviewByProductId(
  req: Request<{ productId: string }, {}, ReviewSchema>,
  res: Response,
  next: NextFunction
) {
  const productId = req.params.productId;
  const userId = req.user?.id!;
  const { title, content, rating, isPublic } = req.body;

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Creating review for product ${productId} by user ${userId}`
      )
    );

    const review = await prisma.review.create({
      data: {
        title,
        content,
        rating,
        user_id: userId,
        product_id: productId,
        ...(isPublic !== undefined && { is_public: isPublic }),
      },
      select: {
        ...reviewSelect,
      },
    });

    console.log(
      chalk.green(`${getTimestamp()} Review created for product ${productId}`)
    );
    return res.status(201).json(review);
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to create review for product ${productId}:`,
        err
      )
    );
    next(err);
  }
}

//take your time with this one
// Get home page products
export async function getHomeProducts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const currency = req.currency!


  try {
    console.log(chalk.yellow(`${getTimestamp()} Fetching home products}`));

    const categories = await prisma.category.findMany();
    const randomCategory =
      categories.length > 0
        ? categories[Math.floor(Math.random() * categories.length)]?.name
        : null;

    const promises: Promise<Product[]>[] = [
      getNewProducts(currency),
      getTrendingProducts(currency),
      getSaleProducts(currency),
    ];

    if (randomCategory) promises.push(getCategoryProducts(randomCategory, currency));

    const results = await Promise.all(promises);

    const [
      newProducts,
      trendingProducts,
      productsOnSale,
      categoryProducts = [],
    ] = results;

    //format price for client

    //calc avg rating

    console.log(
      chalk.green(`${getTimestamp()} Home products fetched successfully`)
    );
    return res.status(200).json({
      newProducts,
      trendingProducts,
      productsOnSale,
      categoryProducts,
    });
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to fetch home products:`, err)
    );
    next(err);
  }
}