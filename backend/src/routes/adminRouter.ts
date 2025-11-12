import { Router } from "express";
import { getNewUsers, getRevenue, getTopsellers } from "../controller/adminController.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";
import { validateTimeframeQuery } from "../middleware/validationMiddleware.js";

const adminRouter = Router()


//jwt user role as source of truth, if roles change often change that since it could be outdated
adminRouter.get("/analytics/revenue",validateTimeframeQuery, getRevenue);
adminRouter.get("/analytics/topsellers",validateTimeframeQuery,getTopsellers);
adminRouter.get("/analytics/newUsers",validateTimeframeQuery,getNewUsers);


export default adminRouter