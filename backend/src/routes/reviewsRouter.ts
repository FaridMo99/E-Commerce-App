import { Router } from "express";
import {
  deleteReviewByReviewId,
  getReviewByReviewId,
  getAllReviews,
  setPublicByReviewId,
} from "../controller/reviewsController.js";
import { hasCsrfToken, isAuthenticated } from "../middleware/authMiddleware.js";
import { validateReviewSearchQueries } from "../middleware/queryMiddleware.js";

const reviewsRouter = Router()

reviewsRouter.get("/", validateReviewSearchQueries,getAllReviews)
reviewsRouter.get("/:reviewId", getReviewByReviewId)
reviewsRouter.delete("/:reviewId", isAuthenticated, hasCsrfToken, deleteReviewByReviewId)
reviewsRouter.patch("/:reviewId", isAuthenticated, hasCsrfToken, setPublicByReviewId);

export default reviewsRouter