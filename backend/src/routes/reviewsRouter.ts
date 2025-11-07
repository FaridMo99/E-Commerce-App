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

//user should also get his own reviews which have ispublic false to be able to toggle it, rn nobody gets them, 
    //its possibly in products router not here


reviewsRouter.get("/", validateReviewSearchQueries,getAllReviews)
reviewsRouter.get("/:reviewId", getReviewByReviewId)
reviewsRouter.delete("/:reviewId", isAuthenticated, deleteReviewByReviewId)
reviewsRouter.patch("/:reviewId", isAuthenticated, setPublicByReviewId);

export default reviewsRouter