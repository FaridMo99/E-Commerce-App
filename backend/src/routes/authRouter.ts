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
  changePasswordAuthenticated,
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
import passport from "../services/passport.js";
import { OauthLogin } from "../lib/auth.js";

const authRouter = Router();

authRouter.post("/login", authRateLimiter, validateLogin, verifyCaptcha, login);
authRouter.post(
  "/signup",
  authRateLimiter,
  validateSignup,
  verifyCaptcha,
  signup,
);
authRouter.post(
  "/logout",
  isAuthenticated,
  hasCsrfToken,
  hasRefreshToken,
  logout,
);
authRouter.post("/verify", verifyUser);
authRouter.post(
  "/new-verify-Link",
  authRateLimiter,
  validateEmail,
  verifyCaptcha,
  sendNewVerifyLink,
);

authRouter.patch(
  "/change-password-authenticated",
  authRateLimiter,
  isAuthenticated,
  hasCsrfToken,
  changePasswordAuthenticated,
);

authRouter.patch("/change-password", authRateLimiter, changePassword);

authRouter.post(
  "/forgot-password",
  authRateLimiter,
  validateEmail,
  verifyCaptcha,
  sendEmailToChangePassword,
);

authRouter.post(
  "/refresh-token",
  authRateLimiter,
  hasRefreshToken,
  issueRefreshToken,
);
//Oauth routes
authRouter.get(
  "/oauth/google",
  authRateLimiter,
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
authRouter.get(
  "/oauth/facebook",
  authRateLimiter,
  passport.authenticate("facebook", {
    scope: ["public_profile", "email"],
    session: false,
  }),
);
authRouter.get(
  "/oauth/google/callback",
  authRateLimiter,
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  OauthLogin,
);
authRouter.get(
  "/oauth/facebook/callback",
  authRateLimiter,
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: "/login",
  }),
  OauthLogin,
);

export default authRouter;

//watch out how to exactly handle oAuth users since there password is optional, like what happens if they hit certain routes
//like change password, verify account, send email etc
