import { Router } from "express";
import { isAdmin, isAuthenticated } from "../middleware/authMiddleware.js";
import { validateProductSearchQueries } from "../middleware/queryMiddleware.js";
import { createProduct, deleteProductByProductId, getAllProducts, getProductByProductId, updateProductByProductId } from "../controller/productsController.js";
import { validateProduct, validateUpdateProduct } from "../middleware/validationMiddleware.js";

const productsRouter = Router()



//think about where to put reviews and orders, like in which router

productsRouter.get("/", validateProductSearchQueries, getAllProducts)
productsRouter.post("/",validateProduct, isAuthenticated, isAdmin, createProduct);
productsRouter.get("/:productId", getProductByProductId)
productsRouter.delete("/:productId", isAuthenticated, isAdmin, deleteProductByProductId)
productsRouter.patch("/:productId",validateUpdateProduct, isAuthenticated, isAdmin, updateProductByProductId)



export default productsRouter