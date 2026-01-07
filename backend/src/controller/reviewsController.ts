import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import type { ReviewsQuerySchema } from "@monorepo/shared";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";
import { reviewSelect, reviewWhere } from "../config/prismaHelpers.js";
import { clearAllCachesProductIsIn } from "../lib/productQueries.js";

const reviewCountToInvalidateCache = 50;

export async function getAllReviews(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { rating, created_at, sortBy, sortOrder, page, limit } = req.validatedQuery as ReviewsQuerySchema;

  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Fetching reviews with query:`, req.query)
    );

    const reviews = await prisma.review.findMany({
      where: {
        ...reviewWhere,
        ...(rating && { rating: Number(rating) }),
        ...(created_at && { created_at: new Date(created_at) }),
      },
      ...(sortBy && sortOrder && { orderBy: { [sortBy]: sortOrder } }),
      ...(limit && { take: limit }),
      ...(page && limit && { skip: (page - 1) * limit }),
      select: {
        ...reviewSelect
      }
    });

    console.log(
      chalk.green(`${getTimestamp()} Fetched ${reviews.length} reviews`)
    );
    return res.status(200).json(reviews);
  } catch (err) {
    console.log(chalk.red(`${getTimestamp()} Failed to fetch reviews`), err);
    next(err);
  }
}

export async function getReviewByReviewId(
  req: Request<{ reviewId: string }>,
  res: Response,
  next: NextFunction
) {
  const id = req.params.reviewId;
  if (!id) {
    console.log(chalk.red(`${getTimestamp()} No review ID provided`));
    return res.status(400).json({ message: "No Id" });
  }

  try {
    console.log(chalk.yellow(`${getTimestamp()} Fetching review by ID: ${id}`));

    const review = await prisma.review.findUnique({
      where: {
        ...reviewWhere,
        id,
      },
      select: {
        ...reviewSelect
      }
    });

    if (!review) {
      console.log(chalk.red(`${getTimestamp()} Review not found: ${id}`));
      return res.status(404).json({ message: "review not found" });
    }

    console.log(chalk.green(`${getTimestamp()} Review fetched: ${id}`));
    return res.status(200).json(review);
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to fetch review: ${id}`),
      err
    );
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
  if (!reviewId) {
    console.log(
      chalk.red(`${getTimestamp()} No review ID provided for deletion`)
    );
    return res.status(400).json({ message: "No Id" });
  }

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Deleting review: ${reviewId} by user: ${userId}`
      )
    );

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        user_id: true,
        product: {
          select: {
            name: true,
            category: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                reviews: {
                  where: {
                    is_public: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!review) {
      console.log(chalk.red(`${getTimestamp()} Review not found: ${reviewId}`));
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user_id !== userId) {
      console.log(
        chalk.red(
          `${getTimestamp()} User ${userId} not authorized to delete review ${reviewId}`
        )
      );
      return res.status(403).json({ message: "Forbidden" });
    }

    const promises: Promise<any>[] = [
      prisma.review.delete({ where: { id: reviewId } }),
    ];

    //only invalidates if reviewCountToInvalidateCache and under
    if (review.product._count.reviews <= reviewCountToInvalidateCache) {
      promises.push(
        clearAllCachesProductIsIn(
          review.product.name,
          review.product.category.name
        )
      );
    }

    await Promise.all(promises);

    console.log(chalk.green(`${getTimestamp()} Review deleted: ${reviewId}`));
    res.status(200).json({ message: "Review deleted" });
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to delete review: ${reviewId}`),
      err
    );
    next(err);
  }
}

export async function setPublicByReviewId(
  req: Request<{ reviewId: string }, {}, { isPublic?: any }>,
  res: Response,
  next: NextFunction
) {
  const { reviewId } = req.params;
  const userId = req.user?.id!;
  const isPublic = req.body.isPublic;

  console.log(isPublic)

    let isPublicBoolean: boolean;

    if (typeof isPublic === "string") {
      if (isPublic.toLowerCase() === "true") isPublicBoolean = true;
      else if (isPublic.toLowerCase() === "false") isPublicBoolean = false;
      else {
        return res.status(400).json({ message: "Invalid isPublic value" });
      }
    } else if (typeof isPublic === "boolean") {
      isPublicBoolean = isPublic;
    } else {
      return res.status(400).json({ message: "Invalid isPublic value" });
    }

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Updating review public status: ${reviewId} to ${isPublic}`
      )
    );

    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
      select: {
        user_id: true,
        product: {
          select: {
            name: true,
            category: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                reviews: {
                  where: {
                    is_public: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!review) {
      console.log(chalk.red(`${getTimestamp()} Review not found: ${reviewId}`));
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user_id !== userId) {
      console.log(
        chalk.red(
          `${getTimestamp()} User ${userId} not authorized to update review ${reviewId}`
        )
      );
      return res.status(403).json({ message: "Forbidden" });
    }

    const promises: Promise<any>[] = [
      prisma.review.update({
        where: {
          id: reviewId,
        },
        data: {
          is_public: isPublicBoolean,
        },
      }),
    ];

    //only invalidate if reviewCountToInvalidateCache reviews and under
    if (review.product._count.reviews <= reviewCountToInvalidateCache) {
      promises.push(
        clearAllCachesProductIsIn(
          review.product.name,
          review.product.category.name
        )
      );
    }

    await Promise.all(promises);

    console.log(
      chalk.green(
        `${getTimestamp()} Review ${reviewId} public status updated to ${isPublic}`
      )
    );
    res
      .status(200)
      .json({
        message: `Review successfully  ${isPublic ? "published" : "deactivated"}`,
      });
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to update review: ${reviewId}`),
      err
    );
    next(err);
  }
}
