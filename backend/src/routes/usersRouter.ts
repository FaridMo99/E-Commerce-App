import { Router } from "express";
import { deleteUserByUserId, getUserByUserId, updateUserByUserId } from "../controller/usersController.js";
import { isAuthenticated, validateUpdateUser } from "../middleware/authMiddleware.js";

const usersRouter = Router()


usersRouter.get("me",isAuthenticated,getUserByUserId)
usersRouter.patch("me",validateUpdateUser,isAuthenticated,updateUserByUserId);
usersRouter.delete("me",isAuthenticated,deleteUserByUserId);


export default usersRouter