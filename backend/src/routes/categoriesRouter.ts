import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllProductCategories,
} from "../controller/categoriesController.js";
import {
  hasCsrfToken,
  isAdmin,
  isAuthenticated,
} from "../middleware/authMiddleware.js";

const categoriesRouter = Router();

categoriesRouter.get("/", getAllProductCategories);

categoriesRouter.post(
  "/",
  isAuthenticated,
  isAdmin,
  hasCsrfToken,
  createCategory,
);

categoriesRouter.delete(
  "/:categoryId",
  isAuthenticated,
  isAdmin,
  hasCsrfToken,
  deleteCategory,
);

export default categoriesRouter;
