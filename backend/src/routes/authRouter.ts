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
  setPassword,
} from "../controller/authController.js";
import {
  hasCsrfToken,
  hasRefreshToken,
  isAuthenticated,
  verifyCaptcha,
} from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validationMiddleware.js";
import { authRateLimiter, geoCurrencyMiddleware } from "../middleware/utilityMiddleware.js";
import passport from "../services/passport.js";
import { OauthLogin } from "../lib/auth.js";
import { CLIENT_ORIGIN } from "../config/env.js";
import { emailSchema, loginSchema, signupSchema } from "@monorepo/shared";

const authRouter = Router();

authRouter.post("/login", authRateLimiter, validateBody(loginSchema), verifyCaptcha, login);
authRouter.post(
  "/signup",
  authRateLimiter,
  validateBody(signupSchema),
  verifyCaptcha,
  geoCurrencyMiddleware,
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
  validateBody(emailSchema),
  verifyCaptcha,
  sendNewVerifyLink
);

authRouter.patch("/change-password", authRateLimiter, changePassword);

authRouter.patch("/change-password-authenticated", isAuthenticated, hasCsrfToken, changePasswordAuthenticated);

authRouter.patch("/set-password", isAuthenticated, hasCsrfToken, setPassword);


authRouter.post(
  "/forgot-password",
  authRateLimiter,
  validateBody(emailSchema),
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
  geoCurrencyMiddleware,
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${CLIENT_ORIGIN}/login`,
  }),
  OauthLogin
);
authRouter.get(
  "/oauth/facebook/callback",
  authRateLimiter,
  geoCurrencyMiddleware,
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: `${CLIENT_ORIGIN}/login`,
  }),
  OauthLogin
);

export default authRouter;