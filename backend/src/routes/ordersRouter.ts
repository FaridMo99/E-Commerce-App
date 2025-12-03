import { Router } from "express";
import {
  hasCsrfToken,
  isAdmin,
} from "../middleware/authMiddleware.js";
import { validateTimeframeQuery } from "../middleware/validationMiddleware.js";
import {
  cancelOrder,
  getOrders,
  makeOrder,
} from "../controller/ordersController.js";
import { geoCurrencyMiddleware } from "../middleware/utilityMiddleware.js";

const ordersRouter = Router();

ordersRouter.get(
  "/",
  isAdmin,
  validateTimeframeQuery,
  getOrders,
);
ordersRouter.post("/", hasCsrfToken, geoCurrencyMiddleware, makeOrder);
ordersRouter.post(
  "/:orderId/cancel",
  hasCsrfToken,
  cancelOrder,
);

export default ordersRouter;
