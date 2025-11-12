import { Router } from "express";
import {
  hasCsrfToken,
  isAdmin,
  isAuthenticated,
} from "../middleware/authMiddleware.js";
import { validateTimeframeQuery } from "../middleware/validationMiddleware.js";
import { getOrders, makeOrder } from "../controller/ordersController.js";

const ordersRouter = Router();

ordersRouter.get(
  "/",
  isAuthenticated,
  isAdmin,
  validateTimeframeQuery,
  getOrders,
);
ordersRouter.post("/", isAuthenticated, hasCsrfToken, makeOrder);

export default ordersRouter;
