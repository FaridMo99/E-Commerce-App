import { Router } from "express";
import { getAllOrdersByUser, getSingleOrderByUser } from "../controller/ordersController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { validateSearchQueries } from "../middleware/queryMiddleware.js";

const ordersRouter = Router()

ordersRouter.get("/",validateSearchQueries,isAuthenticated,getAllOrdersByUser)
ordersRouter.get("/:orderId", isAuthenticated,getSingleOrderByUser)



export default ordersRouter