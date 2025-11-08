import { Router } from "express";
import { hasCsrfToken, isAdmin, isAuthenticated } from "../middleware/authMiddleware.js";
import { validateProductSearchQueries } from "../middleware/queryMiddleware.js";
import { createProduct, createReviewByProductId, deleteProductByProductId, getAllProducts, getAllReviewsByProductId, getProductByProductId, updateProductByProductId } from "../controller/productsController.js";
import { validateProduct, validateReview, validateUpdateProduct } from "../middleware/validationMiddleware.js";
import { upload } from "../services/cloud.js";

const productsRouter = Router()

productsRouter.get("/", validateProductSearchQueries, getAllProducts)
productsRouter.post("/", isAuthenticated, isAdmin, hasCsrfToken, upload.array("images"), validateProduct, createProduct);
productsRouter.get("/:productId/reviews",getAllReviewsByProductId);
productsRouter.post("/:productId/reviews", validateReview, isAuthenticated, createReviewByProductId);
productsRouter.get("/:productId", getProductByProductId)
productsRouter.delete("/:productId", isAuthenticated, isAdmin, deleteProductByProductId)
productsRouter.patch("/:productId",validateUpdateProduct, isAuthenticated, isAdmin, updateProductByProductId)



export default productsRouter