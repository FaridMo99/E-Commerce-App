import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import type { ReviewsQuerySchema } from "@monorepo/shared";


export async function getAllReviews(req: Request<{}, {}, {},ReviewsQuerySchema>, res: Response, next: NextFunction) {
    const { rating, created_at, sortBy, sortOrder, page, limit} = req.query

    try {
    const reviews = await prisma.review.findMany({
      where: {
        is_public: true,
        ...(rating && { rating: Number(rating) }),
        ...(created_at && { created_at: new Date(created_at) }),
      },
      ...(sortBy && sortOrder && { orderBy: { [sortBy]: sortOrder } }),
      ...(limit && { take: parseInt(limit) }),
      ...(page && limit && { skip: (parseInt(page) - 1) * parseInt(limit) }),
    });
        return res.status(200).json(reviews)
    } catch (err) {
        next(err)
    }
}

export async function getReviewByReviewId(
  req: Request<{ reviewId: string }>,
  res: Response,
  next: NextFunction
) {
  const id = req.params.reviewId;
  if (!id) return res.status(400).json({ message: "No Id" });

  try {
    const review = await prisma.review.findUnique({
      where: { id, is_public: true },
    });

    if (!review) return res.status(404).json({ message: "review not found" });

    return res.status(200).json(review);
  } catch (err) {
    next(err);
  }
}

export async function deleteReviewByReviewId(
  req: Request<{ reviewId: string }>,
  res: Response,
  next: NextFunction
) {
  const { reviewId } = req.params;
  const userId = req.user?.id!;
  if (!reviewId) return res.status(400).json({ message: "No Id" });

  try {
    //check if exists
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) return res.status(404).json({ message: "Review not found" });

    //check if authorized
    if (review.user_id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    //delete if successful
    await prisma.review.delete({ where: { id: reviewId } });
    res.status(200).json({ message: "Review deleted" });
  } catch (err) {
    next(err);
  }
}

//on purpose user shouldnt be able to update more
export async function setPublicByReviewId(req: Request<{ reviewId: string }, {}, { isPublic?: any }>, res: Response, next: NextFunction) {
    const { reviewId } = req.params;
    const userId = req.user?.id!;
    const isPublic = req.body.isPublic
    
    if (!isPublic && typeof isPublic !== "boolean") return res.status(400).json({message: "Bad Request"})
  try {
    //check if exists
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) return res.status(404).json({ message: "Review not found" });

    //check if authorized
    if (review.user_id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    //delete if successful
      await prisma.review.update({
          where: { id: reviewId },
          data: {
              is_public:isPublic
          }
      });
    res.status(200).json({ message: "Review deleted" });
  } catch (err) {
    next(err);
  }
}