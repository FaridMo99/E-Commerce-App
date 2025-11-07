import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import type { ProductSchema, ProductsQuerySchema, ReviewSchema, UpdateProductSchema } from "@monorepo/shared";
import { Decimal } from "@prisma/client/runtime/library";
import { deleteCloudAsset, handleCloudUpload } from "../services/cloud.js";


//render for admin products so he knows which arent public and which are
//add a search query to get stock amount also for admin(doesnt need to be protected)
export async function getAllProducts(req: Request<{}, {}, {}, ProductsQuerySchema>,res:Response, next:NextFunction) {
    const role = req.user?.role
    const { search, category, minPrice, maxPrice, sortBy, sortOrder, page, limit } = req.query
  

    try {
    const products = await prisma.product.findMany({
    where: {
      ...(role !== "ADMIN" && { is_public: true }),
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(category && { category:{name:category} }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined && { gte: new Decimal(minPrice) }),
              ...(maxPrice !== undefined && { lte: new Decimal(maxPrice) }),
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
        price: new Decimal(product.price),
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


export async function deleteProductByProductId(req: Request, res: Response, next: NextFunction) { 
        const id = req.params.productId!;

        try {
         const product = await prisma.product.delete({
            where: {
              id,
            },
         });
          
          if (product.imageUrls.length > 0) {
            await Promise.all(
              product.imageUrls.map((url) => deleteCloudAsset(url))
            );
          }

          return res.status(200).json({ message: "Product successfuly deleted" });
        } catch (err) {
          next(err);
        }
}


export async function updateProductByProductId(req: Request<{productId:string}, {},UpdateProductSchema>, res: Response, next: NextFunction) {
  const id = req.params.productId
  const { name, description, price, stock_quantity, is_public, category } = req.body

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price }),
        ...(stock_quantity && { stock_quantity }),
        ...(is_public && { is_public }),
        ...(category && { category: { connect: { name: category } } }),
        updated_at:new Date()
      }
    })

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