import { Router } from "express";
import { createCategory, deleteCategory, getAllProductCategories } from "../controller/categoriesController.js";
import { isAdmin, isAuthenticated } from "../middleware/authMiddleware.js";

const categoriesRouter = Router()


categoriesRouter.get("/", getAllProductCategories)
categoriesRouter.post("/", isAuthenticated, isAdmin, createCategory)
categoriesRouter.delete("/:categoryId", isAuthenticated, isAdmin, deleteCategory);


export default categoriesRouter