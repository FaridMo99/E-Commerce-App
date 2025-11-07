import { Router } from "express";
import {
  deleteReviewByReviewId,
  getReviewByReviewId,
  getAllReviews,
  setPublicByReviewId,
} from "../controller/reviewsController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { validateReviewSearchQueries } from "../middleware/queryMiddleware.js";

const reviewsRouter = Router()

reviewsRouter.get("/", validateReviewSearchQueries,getAllReviews)
reviewsRouter.get("/:reviewId", getReviewByReviewId)
reviewsRouter.delete("/:reviewId", isAuthenticated, deleteReviewByReviewId)
reviewsRouter.patch("/:reviewId", isAuthenticated, setPublicByReviewId);

export default reviewsRouter