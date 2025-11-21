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
  exchangeAllPricesInCents,
  formatPricesForClientAndCalculateAverageRating,
  turnPriceToPriceInCents,
} from "../lib/currencyHandlers.js";
import type { CurrencyISO } from "../generated/prisma/enums.js";
import {
  BASE_CURRENCY_KEY,
  NEW_PRODUCTS_REDIS_KEY,
  SALE_PRODUCTS_REDIS_KEY,
  SUPPORTED_CURRENCIES,
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
  type ProductWithSelectedFields,
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

    //add images to cloud
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
      const currencySetting = await tx.settings.findFirst({
        where: { key: BASE_CURRENCY_KEY },
      });
      if (!currencySetting) throw new Error("Base currency not set");

      const baseCurrency = currencySetting.value as CurrencyISO;

      //prices come as float gotta transform to cents
      product.price = turnPriceToPriceInCents(product.price);
      if (product.sale_price) {
        product.sale_price = turnPriceToPriceInCents(product.sale_price);
      }

      //convert to all supported prices
      const allPrices = await exchangeAllPricesInCents(
        baseCurrency,
        product.price,
        product.sale_price
      );

      //create product
      const createData = {
        name: product.name,
        ...(imageUrls && { imageUrls }),
        currency: baseCurrency,
        description: product.description,
        stock_quantity: product.stock_quantity,
        is_public: product.is_public,
        ...(product.is_public && { published_at: new Date() }),
        category: { connect: { name: product.category } },
        price_in_USD: allPrices.USD.priceInCents,
        price_in_GBP: allPrices.GBP.priceInCents,
        price_in_EUR: allPrices.EUR.priceInCents,
        ...(allPrices.USD.salePriceInCents && {
          sale_price_in_USD: allPrices.USD.salePriceInCents,
        }),
        ...(allPrices.GBP.salePriceInCents && {
          sale_price_in_GBP: allPrices.GBP.salePriceInCents,
        }),
        ...(allPrices.EUR.salePriceInCents && {
          sale_price_in_EUR: allPrices.EUR.salePriceInCents,
        }),
      };

      return tx.product.create({
        data: createData,
        select: {
          ...productSelector(baseCurrency),
        },
      });
    });

    //build redis keys
    const productsRedisKeys = SUPPORTED_CURRENCIES.map(
      (currency) => `${NEW_PRODUCTS_REDIS_KEY}:${currency}`
    );

    const saleProductsRedisKeys = SUPPORTED_CURRENCIES.map(
      (currency) => `${SALE_PRODUCTS_REDIS_KEY}:${currency}`
    );

    const categoryRedisKeys = SUPPORTED_CURRENCIES.map(
      (currency) => `categoryProducts:${product.category}:currency:${currency}`
    );

    //clear all relevant caches
    await Promise.all([
      ...productsRedisKeys.map((key) => redis.del(key)),
      ...categoryRedisKeys.map((key) => redis.del(key)),
      ...(product.sale_price
        ? saleProductsRedisKeys.map((key) => redis.del(key))
        : []),
    ]);

    console.log(
      chalk.green(
        `${getTimestamp()} Product ${product.name} created successfully`
      )
    );

    return res.status(201).json({ message: "Added Product successfully" });
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

// Update a product
export async function updateProductByProductId(
  req: Request<{ productId: string }, {}, UpdateProductSchema>,
  res: Response,
  next: NextFunction
) {
  const id = req.params.productId;


  let {
    name,
    description,
    price,
    stock_quantity,
    is_public,
    category,
    sale_price,
  } = req.body;

  try {
    console.log(chalk.yellow(`${getTimestamp()} Updating product ${id}`));

    const updatedProduct = await prisma.$transaction(async (tx) => {
      
      //get base currency
      const currencySetting = await tx.settings.findFirst({
        where: { key: BASE_CURRENCY_KEY },
      });
      if (!currencySetting) throw new Error("Base currency not set");
      const baseCurrency = currencySetting.value as CurrencyISO;

      //prices to cent
      let priceInCents: number | undefined;
      let salePriceInCents: number | undefined;

      if (typeof price === "number") {
        priceInCents = turnPriceToPriceInCents(price);
      }
      if (typeof sale_price === "number") {
        salePriceInCents = turnPriceToPriceInCents(sale_price);
      }

      //all supported prices cnvert
      let allPrices:
        | Awaited<ReturnType<typeof exchangeAllPricesInCents>>
        | undefined;

      if (priceInCents !== undefined) {
        allPrices = await exchangeAllPricesInCents(
          baseCurrency,
          priceInCents,
          salePriceInCents
        );
      }

      const updateData: any = { updated_at: new Date() };

      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (typeof stock_quantity === "number")
        updateData.stock_quantity = stock_quantity;

      if (typeof is_public === "boolean") {
        updateData.is_public = is_public;
        if (is_public) updateData.published_at = new Date();
      }

      if (category) updateData.category = { connect: { name: category } };

      if (priceInCents !== undefined && allPrices) {
        updateData.price_in_USD = allPrices.USD.priceInCents;
        updateData.price_in_GBP = allPrices.GBP.priceInCents;
        updateData.price_in_EUR = allPrices.EUR.priceInCents;

        if (allPrices.USD.salePriceInCents)
          updateData.sale_price_in_USD = allPrices.USD.salePriceInCents;

        if (allPrices.GBP.salePriceInCents)
          updateData.sale_price_in_GBP = allPrices.GBP.salePriceInCents;

        if (allPrices.EUR.salePriceInCents)
          updateData.sale_price_in_EUR = allPrices.EUR.salePriceInCents;
      }

      //update
      const product = await tx.product.update({
        where: { id },
        data: updateData,
        select: {
          ...productSelector(baseCurrency),
        },
      });

      //if made not public, clean favorites and carts
      if (is_public === false) {
        await tx.product.update({
          where: { id },
          data: { favoredBy: { set: [] } },
        });

        await tx.cartItem.deleteMany({ where: { productId: id } });
      }

      await tx.recentlyViewed.deleteMany({ where: { productId: id } });

      return product;
    });

    if (!updatedProduct) {
      console.log(chalk.red(`${getTimestamp()} Product ${id} not found`));
      return res.status(404).json({ message: "Product not found" });
    }

    //redis invalidation
    if (is_public) {
      const newProductsKeys = SUPPORTED_CURRENCIES.map(
        (currency) => `${NEW_PRODUCTS_REDIS_KEY}:${currency}`
      );
      const saleProductsKeys = SUPPORTED_CURRENCIES.map(
        (currency) => `${SALE_PRODUCTS_REDIS_KEY}:${currency}`
      );
      const categoryKeys = SUPPORTED_CURRENCIES.map(
        (currency) => `categoryProducts:${category}:currency:${currency}`
      );

      await Promise.all([
        ...newProductsKeys.map((key) => redis.del(key)),
        ...(sale_price ? saleProductsKeys.map((key) => redis.del(key)) : []),
        ...categoryKeys.map((key) => redis.del(key)),
      ]);
    }

    console.log(
      chalk.green(`${getTimestamp()} Product ${id} updated successfully`)
    );

    return res.status(200).json({message:"Updated product successfully"});
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

// Get home page products
export async function getHomeProducts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const currency = req.currency!

  const priceField = `price_in_${currency}` as keyof typeof productSelect;
  const salePriceField = `sale_price_in_${currency}` as keyof typeof productSelect;

  try {
    console.log(chalk.yellow(`${getTimestamp()} Fetching home products}`));

    const categories = await prisma.category.findMany();
    const randomCategory =
      categories.length > 0
        ? categories[Math.floor(Math.random() * categories.length)]?.name
        : null;

    const promises: Promise<ProductWithSelectedFields[]>[] = [
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

    console.log(
      chalk.green(`${getTimestamp()} Home products fetched successfully`)
    );

    //format price and calc avg for client
    if (newProducts && newProducts.length > 0) {
      newProducts.forEach((product) =>
        formatPricesForClientAndCalculateAverageRating(
          product,
          priceField,
          salePriceField
        )
      )
    }

    if (trendingProducts && trendingProducts.length > 0) {
      trendingProducts.forEach((product) =>
        formatPricesForClientAndCalculateAverageRating(
          product,
          priceField,
          salePriceField
        )
      );
    }

    if (productsOnSale && productsOnSale.length > 0) {
      productsOnSale.forEach((product) =>
        formatPricesForClientAndCalculateAverageRating(
          product,
          priceField,
          salePriceField
        )
      );
    }

    if (categoryProducts && categoryProducts.length > 0) {
      categoryProducts.forEach((product) =>
        formatPricesForClientAndCalculateAverageRating(
          product,
          priceField,
          salePriceField
        )
      );
    }

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