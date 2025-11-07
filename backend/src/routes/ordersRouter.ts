import { Router } from "express";
import { isAdmin, isAuthenticated } from "../middleware/authMiddleware.js";
import { validateTimeframeQuery } from "../middleware/validationMiddleware.js";
import { getOrders } from "../controller/ordersController.js";

const ordersRouter = Router()

//post put patch delete should happen through stripe webhook not here
ordersRouter.get("/", isAuthenticated, isAdmin, validateTimeframeQuery, getOrders);


export default ordersRouter