import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import {
  type ProductSchema,
  type ProductsMetaInfosQuerySchema,
  type ProductsQuerySchema,
  type ReviewSchema,
  type UpdateProductSchema,
} from "@monorepo/shared";
import { deleteCloudAsset, handleCloudUpload } from "../services/cloud.js";
import {
  convertAndFormatPriceInCents,
  getBaseCurrency,
  getExchangeRates,
  transformAndFormatProductPrice,
  turnPriceToPriceInCents,
} from "../lib/currencyHandlers.js";
import type { CurrencyISO } from "../generated/prisma/enums.js";
import {
  BASE_CURRENCY_KEY,
  CATEGORIES_REDIS_KEY,
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
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";
import {
  productSelect,
  productWhere,
  reviewSelect,
  reviewWhere,
  type ProductWithSelectedFields,
} from "../config/prismaHelpers.js";

export async function getAllProducts(
  req: Request,
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
  } = req.validatedQuery as ProductsQuerySchema;

  const currency = req.currency!;

  //convert currency to main currency
    let convertedMinPrice: number | undefined = minPrice;
    let convertedMaxPrice: number | undefined = maxPrice;

  if ((minPrice !== undefined || maxPrice !== undefined) && currency !== undefined) {
    const baseCurrency = await getBaseCurrency(); 

    if (currency !== baseCurrency) {
      if (minPrice !== undefined) {
        convertedMinPrice = await convertAndFormatPriceInCents(
          minPrice,
          baseCurrency,
          currency
        );
      }
      if (maxPrice !== undefined) {
        convertedMaxPrice = await convertAndFormatPriceInCents(
          maxPrice,
          baseCurrency,
          currency
        );
      }
    }
  }

    const priceFilter =
      convertedMinPrice !== undefined || convertedMaxPrice !== undefined
        ? {
            OR: [
              {
                price: {
                  ...(convertedMinPrice !== undefined && {
                    gte: convertedMinPrice,
                  }),
                  ...(convertedMaxPrice !== undefined && {
                    lte: convertedMaxPrice,
                  }),
                },
              },
              {
                sale_price: {
                  ...(convertedMinPrice !== undefined && {
                    gte: convertedMinPrice,
                  }),
                  ...(convertedMaxPrice !== undefined && {
                    lte: convertedMaxPrice,
                  }),
                },
              },
            ],
          }
        : {};



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
        ...(sale && { sale_price: { not: null } }),
        ...priceFilter
      },
      ...(sortBy && sortOrder && { orderBy: { [sortBy]: sortOrder } }),
      ...(limit && { take: limit }),
      ...(page && limit && { skip: (page - 1) * limit }),
      select: {
        ...productSelect,
      },
    });

    console.log(
      chalk.green(`${getTimestamp()} Retrieved ${products.length} products`)
    );

    //format price from cent to .niceprice
    await Promise.all(
      products.map((product) =>
        transformAndFormatProductPrice(product, product.currency, currency)
      )
    );

    console.log(chalk.green(`${getTimestamp()} Products fetched successfully`));
    return res.status(200).json(products);
  } catch (err) {
    console.log(chalk.red(`${getTimestamp()} Failed to fetch products:`, err));
    next(err);
  }
}

export async function getProductsMetaInfos(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const currency = req.currency!;
  const { category, search, minPrice, maxPrice, sale } =
    req.validatedQuery as ProductsMetaInfosQuerySchema;
    
  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Fetching products meta info...`)
    );

    const filters: any = {};

    if (category) {
      filters.category = { name: category };
    }

    if (search) {
      filters.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = minPrice;
      if (maxPrice) filters.price.lte = maxPrice;
    }

        if (sale !== undefined) {
          if (sale) filters.sale_price = { not: null };
          else filters.sale_price = null;
        }

    const [meta, baseCurrency] = await Promise.all([prisma.product.aggregate({
      where: filters,
      _min: { price: true },
      _max: { price: true },
      _count: true,
    }), getBaseCurrency()])
    
    // Convert meta prices
    const minPriceConverted = await convertAndFormatPriceInCents(
      meta._min.price ?? 0,
      baseCurrency, 
      currency
    );

    const maxPriceConverted = await convertAndFormatPriceInCents(
      meta._max.price ?? 0,
      baseCurrency,
      currency
    );

    return res.status(200).json({
      minPrice: minPriceConverted,
      maxPrice: maxPriceConverted,
      totalItems: meta._count,
      currency
    });
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to fetch meta infos:`, err)
    );
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

      //create product
      const createData = {
        name: product.name,
        ...(imageUrls && { imageUrls }),
        currency: baseCurrency,
        description: product.description,
        stock_quantity: product.stock_quantity,
        is_public: product.is_public,
        ...(product.is_public && { published_at: new Date() }),
        category: {
          connectOrCreate: {
            where: {
              name: product.category
            },
            create: {
              name: product.category
            }
          }
        },
        price: product.price,
        ...(product.sale_price !== undefined && {
          sale_price: product.sale_price,
        }),
      };

      return tx.product.create({
        data: createData,
        select: {
          ...productSelect,
        },
      });
    });


    const redisKey = `CATEGORIES_REDIS_KEY:${newProduct.category}`;
    //clear all relevant caches
    if (newProduct.is_public) {
    await Promise.all([
      redis.del(NEW_PRODUCTS_REDIS_KEY),
      redis.del(SALE_PRODUCTS_REDIS_KEY),
      redis.del(CATEGORIES_REDIS_KEY),
      redis.del(redisKey),
    ]);  
    }
    
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


  try {
    console.log(chalk.yellow(`${getTimestamp()} Fetching product ${id}`));

    const product = await prisma.product.findUnique({
      where: { ...productWhere, id },
      select: {
        ...productSelect,
      },
    });

    if (!product) {
      console.log(chalk.red(`${getTimestamp()} Product ${id} not found`));
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(
      chalk.green(`${getTimestamp()} Product ${id} fetched successfully`)
    );

    //format price and calc avg
    await transformAndFormatProductPrice(product, product.currency, currency);

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

  if (req.body.price !== undefined) {
    req.body.price = turnPriceToPriceInCents(req.body.price);
  }

  if (req.body.sale_price !== undefined) {
    req.body.sale_price = turnPriceToPriceInCents(req.body.sale_price);
  }

  const {
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

      //update
      const product = await tx.product.update({
        where: { id },
        data: {
          updated_at: new Date(),
          ...(name && { name }),
          ...(description && { description }),
          ...(category && {
            category: {
              connectOrCreate: {
                where: {
                  name: category,
                },
                create: {
                  name: category,
                },
              },
            },
          }),
          ...(price !== undefined && { price }),
          ...(stock_quantity !== undefined && { stock_quantity }),
          ...(sale_price !== undefined && { sale_price }),
          ...(typeof is_public === "boolean" && { is_public }),
          ...(is_public && { published_at: new Date() }),
        },
        select: {
          ...productSelect,
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
    const redisKey = `CATEGORIES_REDIS_KEY:${updatedProduct.category}`;
    if (is_public) {
        await Promise.all([
          redis.del(NEW_PRODUCTS_REDIS_KEY),
          redis.del(SALE_PRODUCTS_REDIS_KEY),
          redis.del(CATEGORIES_REDIS_KEY),
          redis.del(redisKey)
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

    const alreadyReviewed = await prisma.review.findFirst({
      where: {
        product_id: productId,
        user_id:userId
      }
    })

    if(alreadyReviewed)return res.status(400).json({message:"You already reviewed this product"})

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

  try {
    console.log(chalk.yellow(`${getTimestamp()} Fetching home products}`));

    const categories = await prisma.category.findMany();
    const randomCategory =
      categories.length > 0
        ? categories[Math.floor(Math.random() * categories.length)]?.name
        : null;

    const promises: Promise<ProductWithSelectedFields[]>[] = [
      getNewProducts(),
      getTrendingProducts(),
      getSaleProducts(),
    ];

    if (randomCategory) promises.push(getCategoryProducts(randomCategory));

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
    await Promise.all([
      ...(newProducts?.map((product) =>
        transformAndFormatProductPrice(product, currency, product.currency)
      ) || []),

      ...(trendingProducts?.map((product) =>
        transformAndFormatProductPrice(product, currency, product.currency)
      ) || []),

      ...(productsOnSale?.map((product) =>
        transformAndFormatProductPrice(product, currency, product.currency)
      ) || []),

      ...(categoryProducts?.map((product) =>
        transformAndFormatProductPrice(product, currency, product.currency)
      ) || []),
    ]);

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