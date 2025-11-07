import { Router } from "express";
import { getAllOrdersByUser, getSingleOrderByUser } from "../controller/ordersController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { validateOrderSearchQueries } from "../middleware/queryMiddleware.js";

const ordersRouter = Router()

//order updates should be for the stock amount and status
ordersRouter.get("/",validateOrderSearchQueries,isAuthenticated,getAllOrdersByUser)
ordersRouter.get("/:orderId", isAuthenticated,getSingleOrderByUser)



export default ordersRouter