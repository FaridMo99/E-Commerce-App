import { Router } from "express";
import {
  getNewUsers,
  getRevenue,
  getTopsellers,
} from "../controller/adminController.js";
import { validateTimeframeQuery } from "../middleware/validationMiddleware.js";
import { geoCurrencyMiddleware } from "../middleware/utilityMiddleware.js";

const adminRouter = Router();

//jwt user role as source of truth, if roles change often change that since it could be outdated
adminRouter.get("/analytics/revenue", validateTimeframeQuery, geoCurrencyMiddleware,getRevenue);
adminRouter.get("/analytics/topsellers", validateTimeframeQuery, geoCurrencyMiddleware,getTopsellers);
adminRouter.get("/analytics/new-users", validateTimeframeQuery, getNewUsers);

export default adminRouter;
