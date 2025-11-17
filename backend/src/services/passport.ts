import passport, { type Profile } from "passport";
import {
  Strategy as GoogleStrategy,
  type StrategyOptionsWithRequest as GoogleStrategyOptions,
  type VerifyCallback,
} from "passport-google-oauth20";
import {
  Strategy as FacebookStrategy,
  type StrategyOptionsWithRequest as FacebookStrategyOptions,
} from "passport-facebook";
import prisma from "./prisma.js";
import type { Request } from "express";
import type { UserCreatedBy } from "../generated/prisma/enums.js";
import {
  BACKEND_URL,
  OAUTH_FACEBOOK_CLIENT_ID,
  OAUTH_FACEBOOK_CLIENT_SECRET,
  OAUTH_GOOGLE_CLIENT_ID,
  OAUTH_GOOGLE_CLIENT_SECRET,
} from "../config/env.js";
import { getTimestamp } from "../lib/utils.js";
import chalk from "chalk";

type MinimalProfile = Pick<Profile, "displayName" | "emails" | "id">;

const googleConfig: GoogleStrategyOptions = {
  clientID: OAUTH_GOOGLE_CLIENT_ID,
  clientSecret: OAUTH_GOOGLE_CLIENT_SECRET,
  callbackURL: `${BACKEND_URL}/api/auth/oauth/google/callback`,
  scope: ["profile", "email"],
  passReqToCallback: true,
};

const facebookConfig: FacebookStrategyOptions = {
  clientID: OAUTH_FACEBOOK_CLIENT_ID,
  clientSecret: OAUTH_FACEBOOK_CLIENT_SECRET,
  callbackURL: `${BACKEND_URL}/api/auth/oauth/facebook/callback`,
  scope: ["public_profile", "email"],
  passReqToCallback: true,
};

function makeVerifyCb(provider: UserCreatedBy) {
  return async function (
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: MinimalProfile,
    done: VerifyCallback,
  ) {
    try {
      const name = profile.displayName;
      const email = profile.emails?.[0]?.value;

      if (!email) {
        console.log(chalk.red(`${getTimestamp()} OAuth login failed: email not provided for provider ${provider}, profile ID: ${profile.id}`));
        return done(new Error("Email not provided"));
      }
      console.log(chalk.blue(`${getTimestamp()} OAuth login attempt via ${provider} for email: ${email} from IP: ${req.ip}`));
      //look for existing user by email
      let user = await prisma.user.findUnique({ where: { email } });

      //if user exists but OAuth not linked, link provider
      if (user && !user.providerId) {

        console.log(chalk.yellow(`${getTimestamp()} Linking ${provider} OAuth to existing user: ${email}...`));

        user = await prisma.user.update({
          where: { email },
          data: { providerId: profile.id, verified:true },
        });

        console.log(chalk.green(`${getTimestamp()} Linking ${provider} OAuth to existing user: ${email} successful`));
      }

      //if no user, create one
      if (!user) {

        console.log(chalk.yellow(`${getTimestamp()} Creating new user via ${provider} OAuth: ${email}...`));

        user = await prisma.user.create({
          data: {
            email,
            name,
            verified: true,
            providerId: profile.id,
            createdBy: provider,
            cart: { create: {} },
          },
        });

        console.log(chalk.green(`${getTimestamp()} Creating new user via ${provider} successful!`));
      }

      req.oAuthUser = { user };

      done(null, user);
    } catch (err) {
      console.log(chalk.red(`${getTimestamp()} OAuth verification error for provider ${provider}`,err));
      done(err);
    }
  };
}

passport.use(new GoogleStrategy(googleConfig, makeVerifyCb("GOOGLE")));
//passport.use(new FacebookStrategy(facebookConfig, makeVerifyCb("FACEBOOK")));

export default passport;
