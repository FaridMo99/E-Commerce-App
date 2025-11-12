import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import {
  currencySchema,
  type ProductSchema,
  type ProductsQuerySchema,
  type ReviewSchema,
  type UpdateProductSchema,
} from "@monorepo/shared";
import { deleteCloudAsset, handleCloudUpload } from "../services/cloud.js";
import {
  exchangeToCurrencyInCents,
  formatPriceForClient,
} from "../lib/currencyHandlers.js";
import type { CurrencyISO } from "../generated/prisma/enums.js";
import { BASE_CURRENCY_KEY } from "../config/constants.js";

//render for admin products so he knows which arent public and which are
//add a search query to get stock amount also for admin(doesnt need to be protected)
//maybe types wont work bc they always strings
export async function getAllProducts(
  req: Request<{}, {}, {}, ProductsQuerySchema>,
  res: Response,
  next: NextFunction,
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
  let currency: CurrencyISO | undefined = req.cookies.currency;

  if (!currency || !currencySchema.safeParse(currency).success) {
    currency = "USD";
  }

  try {
    //get products
    const products = await prisma.product.findMany({
      where: {
        ...(role !== "ADMIN" && { is_public: true }),
        deleted: false,
        ...(search && { name: { contains: search, mode: "insensitive" } }),
        ...(category && { category: { name: category } }),
        ...(sale && { sale }),
        ...(minPrice || maxPrice
          ? {
              // has to use the curreny saved in db
              price: {
                ...(minPrice && { gte: minPrice }),
                ...(maxPrice && { lte: maxPrice }),
              },
            }
          : {}),
      },
      ...(sortBy && sortOrder && { orderBy: { [sortBy]: sortOrder } }),
      ...(limit && { take: parseInt(limit) }),
      ...(page && limit && { skip: (parseInt(page) - 1) * parseInt(limit) }),
    });

    if (products.length > 0 && products[0]?.currency !== currency) {
      const formattedProducts = await Promise.all(
        products.map(async (product) => {
          const exchangedProduct = await exchangeToCurrencyInCents(
            product.currency,
            product.price,
            currency,
          );
          product.price = formatPriceForClient(
            exchangedProduct.exchangedPriceInCents,
          );
          product.currency = exchangedProduct.currency;
          if (product.sale_price) {
            const exchangedSaleProduct = await exchangeToCurrencyInCents(
              product.currency,
              product.sale_price,
              currency,
            );
            product.sale_price = formatPriceForClient(
              exchangedSaleProduct.exchangedPriceInCents,
            );
          }
          return product;
        }),
      );

      return res.status(200).json(formattedProducts);
    }

    //transformation for when request currency is the same as in db stored
    if (products.length > 0) {
      const formattedProducts = products.map((product) => {
        product.price = formatPriceForClient(product.price);

        if (product.sale_price) {
          product.sale_price = formatPriceForClient(product.sale_price);
        }
        return product;
      });
      return res.status(200).json(formattedProducts);
    }

    return res.status(200).json(products);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(
  req: Request<{}, {}, ProductSchema>,
  res: Response,
  next: NextFunction,
) {
  const product = req.body;
  const images = req.files;

  try {
    let imageUrls: string[] | undefined;
    if (images && Array.isArray(images)) {
      const results = await Promise.all(
        images.map((image) => handleCloudUpload(image)),
      );
      imageUrls = results.map((result) => result.secure_url);
    }

    const newProduct = await prisma.$transaction(async (tx) => {
      const currency = await tx.settings.findFirst({
        where: { key: BASE_CURRENCY_KEY },
      });

      if (!currency) throw new Error("Base currency not found");

      return tx.product.create({
        data: {
          name: product.name,
          ...(imageUrls && { imageUrls: [...imageUrls] }),
          price: product.price,
          currency: currency.value as CurrencyISO,
          description: product.description,
          stock_quantity: product.stock_quantity,
          is_public: product.is_public,
          category: {
            connect: { name: product.category },
          },
        },
      });
    });

    newProduct.price = formatPriceForClient(newProduct.price);
    if (newProduct.sale_price) {
      newProduct.sale_price = formatPriceForClient(newProduct.sale_price);
    }

    return res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
}

export async function getProductByProductId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = req.params.productId!;
  let currency: CurrencyISO | undefined = req.cookies.currency;

  if (!currency || !currencySchema.safeParse(currency).success) {
    currency = "USD";
  }

  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
        is_public: true,
        deleted:false
      },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const exchangedPrice = await exchangeToCurrencyInCents(
      product.currency,
      product.price,
      currency,
    );
    product.price = formatPriceForClient(exchangedPrice.exchangedPriceInCents);
    product.currency = exchangedPrice.currency;

    if (product.sale_price) {
      const saleExchangedPrice = await exchangeToCurrencyInCents(
        product.currency,
        product.sale_price,
        currency,
      );
      product.sale_price = formatPriceForClient(
        saleExchangedPrice.exchangedPriceInCents,
      );
    }

    return res.status(200).json(product);
  } catch (err) {
    next(err);
  }
}

export async function deleteProductByProductId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = req.params.productId!;

  try {
    //fetch product
    const preProduct = await prisma.product.findUnique({ where: { id } });
    if (!preProduct)
      return res.status(404).json({ message: "Product not found" });

    //keep first image, delete rest from cloud
    const imagesToDelete = preProduct.imageUrls.slice(1);
    if (imagesToDelete.length > 0) {
      await Promise.all(imagesToDelete.map((url) => deleteCloudAsset(url)));
    }

    //update product
    const product = await prisma.$transaction(async (tx) => {
      //delete product
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          deleted: true,
          imageUrls: preProduct.imageUrls.slice(0, 1),
        },
      });

      //remove from all favorites
      await tx.product.update({
        where: { id },
        data: {
          favoredBy: {
            set: [],
          },
        },
      });

      //remove from all carts
      await tx.cartItem.deleteMany({
        where: { productId: id },
      });

      return updatedProduct;
    });

    return res.status(200).json({ message: "Product successfully deleted" });
  } catch (err) {
    next(err);
  }
}

export async function updateProductByProductId(
  req: Request<{ productId: string }, {}, UpdateProductSchema>,
  res: Response,
  next: NextFunction,
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

  try {
    const product = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(price && { price }),
          ...(stock_quantity && { stock_quantity }),
          ...(typeof is_public === "boolean" && { is_public }),
          ...(sale_price && { sale_price }),
          ...(category && { category: { connect: { name: category } } }),
          updated_at: new Date(),
        },
      });

      //if product is made private, remove from favorites & carts
      if (is_public === false) {
        //remove from favorites
        await tx.product.update({
          where: { id },
          data: {
            favoredBy: {
              set: [],
            },
          },
        });

        //remove from all carts
        await tx.cartItem.deleteMany({
          where: { productId: id },
        });
      }

      return updatedProduct;
    });

    if (!product) return res.status(404).json({ message: "Product not found" });
    product.price = formatPriceForClient(product.price);
    if (product.sale_price) {
      product.sale_price = formatPriceForClient(product.sale_price);
    }

    return res.status(200).json(product);
  } catch (err) {
    next(err);
  }
}

export async function getAllReviewsByProductId(
  req: Request<{ productId: string }>,
  res: Response,
  next: NextFunction,
) {
  const productId = req.params.productId;

  try {
    const reviews = await prisma.review.findMany({
      where: { product_id: productId, is_public: true },
    });

    return res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
}

export async function createReviewByProductId(
  req: Request<{ productId: string }, {}, ReviewSchema>,
  res: Response,
  next: NextFunction,
) {
  const productId = req.params.productId;
  const userId = req.user?.id!;
  const { title, content, rating, isPublic } = req.body;
  try {
    const review = await prisma.review.create({
      data: {
        title,
        content,
        rating,
        user_id: userId,
        product_id: productId,
        ...(isPublic !== undefined && { is_public: isPublic }),
      },
    });

    return res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}
