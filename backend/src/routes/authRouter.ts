import { Router } from "express";
import { changePassword, sendNewVerifyLink, login, logout, signup, verifyUser, sendEmailToChangePassword, issueRefreshToken } from "../controller/authController.js";
import { hasCsrfToken, isAuthenticated, validateLogin, validateSignup } from "../middleware/authMiddleware.js";
import { validateEmail } from "../middleware/validationMiddleware.js";
import { authRateLimiter } from "../middleware/utilityMiddleware.js";

const authRouter = Router()

authRouter.post("/login",authRateLimiter, validateLogin, login)
authRouter.post("/signup",authRateLimiter, validateSignup, signup);
authRouter.post("/logout", isAuthenticated, hasCsrfToken, logout);
authRouter.post("/verify", verifyUser);
authRouter.post("/new-verify-Link",authRateLimiter, validateEmail, sendNewVerifyLink);
authRouter.patch("/change-password",authRateLimiter,isAuthenticated,changePassword);
authRouter.post("/forgot-password",authRateLimiter, validateEmail,sendEmailToChangePassword);
authRouter.post("/refresh-token", authRateLimiter, issueRefreshToken);

export default authRouter