import { Router } from "express";
import { addProductToUserCart, emptyCart, deleteUserByUserId, getAllOrdersByUser, getReviewsByUser, getSingleOrderByUser, getUserByUserId, getUserCart, updateUserByUserId, removeProductFromUserCart, getFavoriteItems, addFavoriteItem, deleteFavoriteItem } from "../controller/usersController.js";
import { hasCsrfToken, isAuthenticated, validateUpdateUser } from "../middleware/authMiddleware.js";
import { validateOrderSearchQueries } from "../middleware/queryMiddleware.js";
import { validateCartItem, validateItemQuantity, validateProductId } from "../middleware/validationMiddleware.js";


const usersRouter = Router()

//user related routes
usersRouter.get("/me", isAuthenticated, getUserByUserId)
usersRouter.patch("/me",validateUpdateUser,isAuthenticated,hasCsrfToken, updateUserByUserId);
usersRouter.delete("/me", isAuthenticated, hasCsrfToken, deleteUserByUserId);

//cart related routes
usersRouter.get("/me/cart", isAuthenticated, getUserCart);
usersRouter.delete("/me/cart", isAuthenticated, hasCsrfToken, emptyCart);

//cart items related routes
usersRouter.post("/me/cart/items",validateCartItem ,isAuthenticated, hasCsrfToken, addProductToUserCart);
usersRouter.delete("/me/cart/items/:itemId", isAuthenticated, hasCsrfToken, removeProductFromUserCart);
usersRouter.patch("/me/cart/items/:itemId",validateItemQuantity,isAuthenticated,hasCsrfToken,addProductToUserCart);

//review related routes
usersRouter.get("/me/reviews", isAuthenticated, getReviewsByUser);

//orders related routes
usersRouter.get("/me/orders", isAuthenticated, validateOrderSearchQueries, getAllOrdersByUser);
usersRouter.get("/me/orders/:orderId", isAuthenticated, getSingleOrderByUser)

//favorite articles routes
usersRouter.get("/me/favorites", isAuthenticated, getFavoriteItems);
usersRouter.post("/me/favorites",validateProductId, isAuthenticated, hasCsrfToken, addFavoriteItem);
usersRouter.delete("/me/favorites/:productId", isAuthenticated, hasCsrfToken, deleteFavoriteItem);


export default usersRouter