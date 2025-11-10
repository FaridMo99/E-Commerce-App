import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import type { ProductSchema, ProductsQuerySchema, ReviewSchema, UpdateProductSchema } from "@monorepo/shared";
import { deleteCloudAsset, handleCloudUpload } from "../services/cloud.js";

//render for admin products so he knows which arent public and which are
//add a search query to get stock amount also for admin(doesnt need to be protected)
//maybe types wont work bc they always strings
export async function getAllProducts(req: Request<{}, {}, {}, ProductsQuerySchema>,res:Response, next:NextFunction) {
    const role = req.user?.role
    const { search, category, minPrice, maxPrice, sortBy, sortOrder, page, limit, sale } = req.query
  

    try {
    const products = await prisma.product.findMany({
      where: {
        ...(role !== "ADMIN" && { is_public: true }),
        deleted:false,
        ...(search && { name: { contains: search, mode: "insensitive" } }),
        ...(category && { category: { name: category } }),
        ...(sale && { sale }),
        ...(minPrice !== undefined || maxPrice !== undefined
          ? {
              price: {
                ...(minPrice !== undefined && { gte:minPrice }),
                ...(maxPrice !== undefined && { lte:maxPrice }),
              },
            }
          : {}),
      },
      ...(sortBy && sortOrder && { orderBy: { [sortBy]: sortOrder } }),
      ...(limit && { take: parseInt(limit) }),
      ...(page && limit && { skip: (parseInt(page) - 1) * parseInt(limit) }),
    });

      return res.status(200).json(products)
    } catch (err) {
        next(err)
    }
}


export async function createProduct(req: Request<{}, {},ProductSchema>, res: Response, next: NextFunction) { 
  const product = req.body
  const images = req.files
  
  try {
    let imageUrls
    if (images && Array.isArray(images)) {
      const results = await Promise.all(images.map(image => handleCloudUpload(image)))
      imageUrls = results.map(result=> result.secure_url)
    }

    const newProduct = await prisma.product.create({
      data: {
        name: product.name,
        ...(imageUrls && { imageUrls: [...imageUrls] }),
        price: product.price,
        currency:product.currency,
        description: product.description,
        stock_quantity: product.stock_quantity,
        is_public: product.is_public,
        category: {
          connect: { name: product.category },
        },
      },
    });
    return res.status(201).json(newProduct)
  } catch (err) {
    next(err)
  }
}

export async function getProductByProductId(req: Request, res: Response, next: NextFunction) {
    const id = req.params.productId!

    try {
        const product = await prisma.product.findUnique({
            where: {
                id
            }
        })
        if (!product) return res.status(404).json({ message: "Product not found" })
        return res.status(200).json(product)
    } catch (err) {
        next(err)
    }
}


export async function deleteProductByProductId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = req.params.productId!;

  try {
    //fetch product
    const preProduct = await prisma.product.findUnique({ where: { id } });
    if (!preProduct) return res.status(404).json({ message: "Product not found" });

    //keep first image, delete rest from cloud
    const imagesToDelete = preProduct.imageUrls.slice(1);
    if (imagesToDelete.length > 0) {
      await Promise.all(imagesToDelete.map((url) => deleteCloudAsset(url)));
    }

    //update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        deleted: true,
        imageUrls: preProduct.imageUrls.slice(0, 1),
      },
    });

    return res.status(200).json({ message: "Product successfully deleted", product });
  } catch (err) {
    next(err);
  }
}


export async function updateProductByProductId(req: Request<{productId:string}, {},UpdateProductSchema>, res: Response, next: NextFunction) {
  const id = req.params.productId
  const { name, description, price, stock_quantity, is_public, category, sale_price } = req.body

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price }),
        ...(stock_quantity && { stock_quantity }),
        ...(is_public && { is_public }),
        ...(sale_price && { sale_price }),
        ...(category && { category: { connect: { name: category } } }),
        updated_at: new Date(),
      },
    });

    return res.status(200).json(product)
  } catch (err) {
    next(err)
  }
}


export async function getAllReviewsByProductId(req: Request<{productId:string}>, res: Response, next: NextFunction) {
  const productId = req.params.productId

  try {
    const reviews = await prisma.review.findMany({
      where:{product_id:productId, is_public:true}
    })

    return res.status(200).json(reviews)
  } catch (err) {
    next(err)
  }
}


export async function createReviewByProductId(req: Request<{productId:string}, {},ReviewSchema>, res: Response, next: NextFunction) {
  const productId = req.params.productId
  const userId = req.user?.id!
  const {title, content, rating, isPublic} = req.body
  try {
    const review = await prisma.review.create({
      data: {
        title,
        content,
        rating,
        user_id: userId,
        product_id: productId,
        ...(isPublic !== undefined && {is_public:isPublic})
      }
    })

    return res.status(201).json(review)
  } catch (err) {
    next(err)
  }
}