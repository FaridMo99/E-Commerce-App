import { Router } from "express";
import { getLowestStockAmount, getNewUsers, getOrders, getOrdersByCategory, getRevenue, getReviews, getTopsellers } from "../controller/adminController.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";

const adminRouter = Router()

//add authz
//also add filtering to analytics and timespans etc, basically just searchqueries
adminRouter.get("/analytics/revenue",isAuthenticated,isAdmin, getRevenue)
adminRouter.get("/analytics/orders", isAuthenticated, isAdmin, getOrders);
adminRouter.get("/analytics/ordersByCategory",isAuthenticated,isAdmin,getOrdersByCategory);
adminRouter.get("/analytics/topsellers",isAuthenticated,isAdmin,getTopsellers);
adminRouter.get("/analytics/newUsers",isAuthenticated,isAdmin,getNewUsers);
adminRouter.get("/analytics/lowestStockAmount",isAuthenticated,isAdmin,getLowestStockAmount);
adminRouter.get("/analytics/reviews",isAuthenticated,isAdmin,getReviews);


export default adminRouter