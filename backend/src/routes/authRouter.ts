import { Router } from "express";
import {
  changePassword,
  sendNewVerifyLink,
  login,
  logout,
  signup,
  verifyUser,
  sendEmailToChangePassword,
  issueRefreshToken,
} from "../controller/authController.js";
import {
  hasCsrfToken,
  hasRefreshToken,
  isAuthenticated,
  validateLogin,
  validateSignup,
  verifyCaptcha,
} from "../middleware/authMiddleware.js";
import { validateEmail } from "../middleware/validationMiddleware.js";
import { authRateLimiter } from "../middleware/utilityMiddleware.js";
import passport from "passport";
import { OauthLogin } from "../lib/auth.js";

const authRouter = Router();

authRouter.post("/login", authRateLimiter, validateLogin, verifyCaptcha, login);
authRouter.post("/signup",authRateLimiter,validateSignup,verifyCaptcha,signup,);
authRouter.post("/logout",isAuthenticated,hasCsrfToken,hasRefreshToken,logout,);
authRouter.post("/verify", verifyUser);
authRouter.post("/new-verify-Link",authRateLimiter,validateEmail,verifyCaptcha,sendNewVerifyLink,);
authRouter.patch("/change-password",authRateLimiter,isAuthenticated,changePassword,);
authRouter.post("/forgot-password",authRateLimiter,validateEmail,verifyCaptcha,sendEmailToChangePassword,);
authRouter.post("/refresh-token",authRateLimiter,hasRefreshToken,issueRefreshToken,);
//Oauth routes
authRouter.get("/oauth/google",authRateLimiter,verifyCaptcha,passport.authenticate("google", {scope: ["profile", "email"],session: false,}),);
authRouter.get("/oauth/facebook",authRateLimiter,verifyCaptcha,passport.authenticate("facebook", {scope: ["public_profile", "email"],session: false,}),);
authRouter.get("/oauth/google/callback",authRateLimiter,passport.authenticate("google", {session: false,failureRedirect: "/login",}),OauthLogin,);
authRouter.get("/oauth/facebook/callback",authRateLimiter,passport.authenticate("facebook", {session: false,failureRedirect: "/login",}),OauthLogin);

export default authRouter;
