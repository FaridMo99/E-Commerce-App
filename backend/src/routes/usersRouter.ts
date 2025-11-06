import { Router } from "express";
import { deleteUserByUserId, getUserByUserId, updateUserByUserId } from "../controller/usersController.js";
import { isAuthenticated, isAuthorizedUser } from "../middleware/authMiddleware.js";

const usersRouter = Router()


usersRouter.get(":userId",isAuthenticated,isAuthorizedUser,getUserByUserId)
usersRouter.patch(":userId",isAuthenticated,isAuthorizedUser,updateUserByUserId);
usersRouter.delete(":userId",isAuthenticated,isAuthorizedUser,deleteUserByUserId);


export default usersRouter