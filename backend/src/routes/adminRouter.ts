import { Router } from "express";
import { getLowestStockAmount, getNewUsers, getOrders, getOrdersByCategory, getRevenue, getReviews, getTopsellers } from "../controller/adminController.js";

const adminRouter = Router()

//add authz
//also add filtering to analytics and timespans etc, basically just searchqueries
adminRouter.get("/analytics/revenue", getRevenue)
adminRouter.get("/analytics/orders", getOrders);
adminRouter.get("/analytics/ordersByCategory", getOrdersByCategory);
adminRouter.get("/analytics/topsellers", getTopsellers);
adminRouter.get("/analytics/newUsers",getNewUsers);
adminRouter.get("/analytics/lowestStockAmount",getLowestStockAmount);
adminRouter.get("/analytics/reviews",getReviews);


export default adminRouter