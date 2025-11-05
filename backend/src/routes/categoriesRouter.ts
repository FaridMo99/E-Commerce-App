import { Router } from "express";
import { getAllProductCategories } from "../controller/categoriesController.js";

const categoriesRouter = Router()

categoriesRouter.get("/", getAllProductCategories)

export default categoriesRouter