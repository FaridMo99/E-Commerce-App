import { Router } from "express";
import { login, logout, signup, verifyUser } from "../controller/authController.js";
import { validateLogin, validateSignup } from "../middleware/authMiddleware.js";

const authRouter = Router()

authRouter.post("/login", validateLogin, login)
authRouter.post("/signup", validateSignup, signup);
authRouter.post("/logout", logout);
authRouter.post("/verify", verifyUser);


export default authRouter