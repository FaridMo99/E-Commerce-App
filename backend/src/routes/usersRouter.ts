import { Router } from "express";
import { deleteUserByUserId, getUserByUserId, updateUserByUserId } from "../controller/usersController.js";

const usersRouter = Router()


usersRouter.get(":userId",getUserByUserId)
usersRouter.patch(":userId",updateUserByUserId);
usersRouter.delete(":userId",deleteUserByUserId);


export default usersRouter