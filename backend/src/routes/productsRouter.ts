import { Router } from "express";
import {
  attachUserIfExists,
  hasCsrfToken,
  isAdmin,
  isAuthenticated,
} from "../middleware/authMiddleware.js";
import {
  createProduct,
  createReviewByProductId,
  deleteProductByProductId,
  getAllProducts,
  getAllReviewsByProductId,
  getHomeProducts,
  getProductByProductId,
  updateProductByProductId,
} from "../controller/productsController.js";
import {
  validateBody,
  validateImages,
  validateSearchQueries,
} from "../middleware/validationMiddleware.js";
import { upload } from "../services/cloud.js";
import { productSchema, productsQuerySchema, reviewSchema, updateProductSchema } from "@monorepo/shared";
import { geoCurrencyMiddleware } from "../middleware/utilityMiddleware.js";

const productsRouter = Router();

productsRouter.get("/", validateSearchQueries(productsQuerySchema),geoCurrencyMiddleware, getAllProducts);
productsRouter.get("/home", attachUserIfExists,geoCurrencyMiddleware, getHomeProducts);
productsRouter.post(
  "/",
  isAuthenticated,
  isAdmin,
  hasCsrfToken,
  upload.array("images"),
  validateImages,
  validateBody(productSchema),
  geoCurrencyMiddleware,
  createProduct,
);
productsRouter.get("/:productId/reviews", getAllReviewsByProductId);
productsRouter.post(
  "/:productId/reviews",
  validateBody(reviewSchema),
  isAuthenticated,
  hasCsrfToken,
  createReviewByProductId,
);
productsRouter.get("/:productId", geoCurrencyMiddleware,getProductByProductId);
productsRouter.delete(
  "/:productId",
  isAuthenticated,
  isAdmin,
  hasCsrfToken,
  deleteProductByProductId,
);
productsRouter.patch(
  "/:productId",
  validateBody(updateProductSchema),
  isAuthenticated,
  isAdmin,
  hasCsrfToken,
  geoCurrencyMiddleware,
  updateProductByProductId,
);

export default productsRouter;
