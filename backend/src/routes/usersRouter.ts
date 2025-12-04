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
} from "../middleware/authMiddleware.js";
import {
  validateBody,
  validateSearchQueries,
} from "../middleware/validationMiddleware.js";
import { addCartItemSchema, itemQuantitySchema, ordersQuerySchema, productIdSchema, updateUserSchema } from "@monorepo/shared";
import { geoCurrencyMiddleware } from "../middleware/utilityMiddleware.js";
import { changePasswordAuthenticated } from "../controller/authController.js";

const usersRouter = Router();

//user related routes
usersRouter.get("/me", getUserByUserId);
usersRouter.patch("/me",validateBody(updateUserSchema), hasCsrfToken, updateUserByUserId);
usersRouter.delete("/me", hasCsrfToken, deleteUserByUserId);

//cart related routes
usersRouter.get("/me/cart", geoCurrencyMiddleware,getUserCart);
usersRouter.delete("/me/cart", hasCsrfToken, emptyCart);

//cart items related routes
usersRouter.post(
  "/me/cart/items",
  validateBody(addCartItemSchema),
  hasCsrfToken,
  geoCurrencyMiddleware,
  addProductToUserCart,
);
usersRouter.delete(
  "/me/cart/items/:itemId",
  hasCsrfToken,
  removeProductFromUserCart,
);
usersRouter.patch(
  "/me/cart/items/:itemId",
  validateBody(itemQuantitySchema),
  hasCsrfToken,
  geoCurrencyMiddleware,
  updateItemQuantity,
);

//review related routes
usersRouter.get("/me/reviews", getReviewsByUser);

//orders related routes
usersRouter.get("/me/orders", validateSearchQueries(ordersQuerySchema), getAllOrdersByUser);
usersRouter.get("/me/orders/:orderId",getSingleOrderByUser);

//favorite articles routes
usersRouter.get("/me/favorites",geoCurrencyMiddleware, getFavoriteItems);
usersRouter.post(
  "/me/favorites",
  hasCsrfToken,
  validateBody(productIdSchema),
  geoCurrencyMiddleware,
  addFavoriteItem,
);
usersRouter.delete(
  "/me/favorites/:productId",
  hasCsrfToken,
  deleteFavoriteItem,
);

//add route and controller for recently viewed products
usersRouter.get(
  "/me/recently-viewed-products",
  geoCurrencyMiddleware,
  getRecentlyViewedProducts,
);

usersRouter.post(
  "/me/recently-viewed-products",
  geoCurrencyMiddleware,
  addProductToRecentlyViewedProductsByProductId
);

export default usersRouter;
