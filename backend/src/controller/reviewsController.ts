import type { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma.js";
import type { ReviewsQuerySchema } from "@monorepo/shared";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";

export async function getAllReviews(
  req: Request<{}, {}, {}, ReviewsQuerySchema>,
  res: Response,
  next: NextFunction
) {
  const { rating, created_at, sortBy, sortOrder, page, limit } = req.query;

  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Fetching reviews with query:`, req.query)
    );

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
      where: { id, is_public: true },
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

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
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

    await prisma.review.delete({ where: { id: reviewId } });
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

  if (!isPublic && typeof isPublic !== "boolean") {
    console.log(
      chalk.red(
        `${getTimestamp()} Invalid isPublic value for review: ${reviewId}`
      )
    );
    return res.status(400).json({ message: "Bad Request" });
  }

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Updating review public status: ${reviewId} to ${isPublic}`
      )
    );

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
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

    await prisma.review.update({
      where: { id: reviewId },
      data: { is_public: isPublic },
    });

    console.log(
      chalk.green(
        `${getTimestamp()} Review ${reviewId} public status updated to ${isPublic}`
      )
    );
    res.status(200).json({ message: "Review updated" });
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to update review: ${reviewId}`),
      err
    );
    next(err);
  }
}
