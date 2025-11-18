import { Router } from "express";
import {
  addProductToUserCart,
  emptyCart,
  deleteUserByUserId,
  getAllOrdersByUser,
  getReviewsByUser,
  getSingleOrderByUser,
  getUserByUserId,
  getUserCart,
  updateUserByUserId,
  removeProductFromUserCart,
  getFavoriteItems,
  addFavoriteItem,
  deleteFavoriteItem,
  updateItemQuantity,
  getRecentlyViewedProducts,
  addProductToRecentlyViewedProductsByProductId,
} from "../controller/usersController.js";
import {
  hasCsrfToken,
  isAuthenticated,
  validateUpdateUser,
} from "../middleware/authMiddleware.js";
import { validateOrderSearchQueries } from "../middleware/queryMiddleware.js";
import {
  validateCartItem,
  validateItemQuantity,
  validateProductId,
} from "../middleware/validationMiddleware.js";

const usersRouter = Router();

//user related routes
usersRouter.get("/me", getUserByUserId);
usersRouter.patch("/me", validateUpdateUser, hasCsrfToken, updateUserByUserId);
usersRouter.delete("/me", hasCsrfToken, deleteUserByUserId);

//cart related routes
usersRouter.get("/me/cart", getUserCart);
usersRouter.delete("/me/cart", hasCsrfToken, emptyCart);

//cart items related routes
usersRouter.post(
  "/me/cart/items",
  validateCartItem,
  hasCsrfToken,
  addProductToUserCart,
);
usersRouter.delete(
  "/me/cart/items/:itemId",
  hasCsrfToken,
  removeProductFromUserCart,
);
usersRouter.patch(
  "/me/cart/items/:itemId",
  validateItemQuantity,
  hasCsrfToken,
  updateItemQuantity,
);

//review related routes
usersRouter.get("/me/reviews", getReviewsByUser);

//orders related routes
usersRouter.get("/me/orders", validateOrderSearchQueries, getAllOrdersByUser);
usersRouter.get("/me/orders/:orderId", getSingleOrderByUser);

//favorite articles routes
usersRouter.get("/me/favorites", getFavoriteItems);
usersRouter.post(
  "/me/favorites",
  validateProductId,
  hasCsrfToken,
  addFavoriteItem,
);
usersRouter.delete(
  "/me/favorites/:productId",
  hasCsrfToken,
  deleteFavoriteItem,
);

//add route and controller for recently viewed products
usersRouter.get(
  "/me/recently-viewed",
  isAuthenticated,
  getRecentlyViewedProducts,
);

usersRouter.post(
  "/me/recently-viewed",
  isAuthenticated,
  addProductToRecentlyViewedProductsByProductId
);

export default usersRouter;
