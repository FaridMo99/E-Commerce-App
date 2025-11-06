import { Router } from "express";
import { getAllOrdersByUser, getSingleOrderByUser } from "../controller/ordersController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { validateOrderSearchQueries } from "../middleware/queryMiddleware.js";

const ordersRouter = Router()

//order should also update stock amount, updating should update state of delivery
ordersRouter.get("/",validateOrderSearchQueries,isAuthenticated,getAllOrdersByUser)
ordersRouter.get("/:orderId", isAuthenticated,getSingleOrderByUser)



export default ordersRouter