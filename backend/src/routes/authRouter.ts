import { Router } from "express";
import { changePassword, sendNewVerifyLink, login, logout, signup, verifyUser, sendEmailToChangePassword } from "../controller/authController.js";
import { isAuthenticated, validateLogin, validateSignup } from "../middleware/authMiddleware.js";
import { validateEmail } from "../middleware/validationMiddleware.js";

const authRouter = Router()

authRouter.post("/login", validateLogin, login)
authRouter.post("/signup", validateSignup, signup);
authRouter.post("/logout", logout);
authRouter.post("/verify", verifyUser);
authRouter.post("/new-verify-Link",validateEmail, sendNewVerifyLink);
authRouter.patch("/change-password",isAuthenticated, changePassword);
authRouter.post("/forgot-password",validateEmail, sendEmailToChangePassword);

export default authRouter