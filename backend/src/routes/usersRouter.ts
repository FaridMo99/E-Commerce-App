import { Router } from "express";
import { addProductToUserCart, deleteCart, deleteUserByUserId, getAllOrdersByUser, getReviewsByUser, getSingleOrderByUser, getUserByUserId, getUserCart, updateCart, updateUserByUserId } from "../controller/usersController.js";
import { hasCsrfToken, isAuthenticated, validateUpdateUser } from "../middleware/authMiddleware.js";
import { validateOrderSearchQueries } from "../middleware/queryMiddleware.js";


const usersRouter = Router()

//user related routes
usersRouter.get("/me", isAuthenticated, getUserByUserId)
usersRouter.patch("/me",validateUpdateUser,isAuthenticated,hasCsrfToken, updateUserByUserId);
usersRouter.delete("/me", isAuthenticated, hasCsrfToken, deleteUserByUserId);


//add validation middleware zod
//cart related routes
usersRouter.get("/me/cart", isAuthenticated, getUserCart);
usersRouter.delete("/me/cart", isAuthenticated, hasCsrfToken, deleteCart);
usersRouter.patch("/me/cart", isAuthenticated, hasCsrfToken, updateCart);

//cart items related routes
usersRouter.post("/me/cart/items",isAuthenticated,hasCsrfToken,addProductToUserCart);

//review related routes
usersRouter.get("/reviews/me", isAuthenticated, getReviewsByUser);

//orders related routes
usersRouter.get("/orders/me", isAuthenticated, validateOrderSearchQueries, getAllOrdersByUser);
usersRouter.get("/orders/me/:orderId", isAuthenticated, getSingleOrderByUser)


export default usersRouter