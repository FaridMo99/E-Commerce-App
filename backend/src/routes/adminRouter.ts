import { Router } from "express";
import { getNewUsers, getOrders, getRevenue, getTopsellers } from "../controller/adminController.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";
import { validateTimeframeQuery } from "../middleware/validationMiddleware.js";

const adminRouter = Router()


//jwt user role as source of truth, if roles change often change that since it could be outdated
adminRouter.get("/analytics/revenue", isAuthenticated, isAdmin,validateTimeframeQuery, getRevenue);
adminRouter.get("/analytics/orders", isAuthenticated, isAdmin,validateTimeframeQuery, getOrders);
adminRouter.get("/analytics/topsellers",isAuthenticated,isAdmin,validateTimeframeQuery,getTopsellers);
adminRouter.get("/analytics/newUsers",isAuthenticated,isAdmin,validateTimeframeQuery,getNewUsers);


export default adminRouter