import { Router } from "express";
import { login, logout, signup, verifyUser } from "../controller/authController.js";

const authRouter = Router()

authRouter.post("/login", login)
authRouter.post("/signup", signup);
authRouter.post("/logout", logout);
authRouter.post("/verify", verifyUser);


export default authRouter