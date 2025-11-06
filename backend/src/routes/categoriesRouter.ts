import { Router } from "express";
import { getAllProductCategories } from "../controller/categoriesController.js";

const categoriesRouter = Router()

//check how you wanna create categories, should be always unique names
categoriesRouter.get("/", getAllProductCategories)

export default categoriesRouter