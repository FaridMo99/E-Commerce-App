import { Router } from "express";
import { deleteUserByUserId, getAllOrdersByUser, getReviewsByUser, getSingleOrderByUser, getUserByUserId, updateUserByUserId } from "../controller/usersController.js";
import { hasCsrfToken, isAuthenticated, validateUpdateUser } from "../middleware/authMiddleware.js";
import { validateOrderSearchQueries } from "../middleware/queryMiddleware.js";


const usersRouter = Router()


usersRouter.get("/me", isAuthenticated, getUserByUserId)
usersRouter.patch("/me",validateUpdateUser,isAuthenticated,hasCsrfToken, updateUserByUserId);
usersRouter.delete("/me",isAuthenticated,hasCsrfToken, deleteUserByUserId);
usersRouter.get("/reviews/me", isAuthenticated,getReviewsByUser);
usersRouter.get("/orders/me", isAuthenticated, validateOrderSearchQueries, getAllOrdersByUser);
usersRouter.get("/orders/me/:orderId", isAuthenticated, getSingleOrderByUser)


export default usersRouter