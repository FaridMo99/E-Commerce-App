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
import dotenv from "dotenv";
import prisma from "./prisma.js";
import type { Request } from "express";
import type { UserCreatedBy } from "../generated/prisma/enums.js";
dotenv.config();

const clientOrigin = process.env.CLIENT_ORIGIN!;


type MinimalProfile = Pick<Profile, "displayName" | "emails" | "id">;


const googleConfig: GoogleStrategyOptions = {
  clientID: process.env.OAUTH_GOOGLE_CLIENT_ID!,
  clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET!,
  callbackURL: `${clientOrigin}/login/google/success`,
  scope: ["profile", "email"],
  passReqToCallback:true,
};

const facebookConfig: FacebookStrategyOptions = {
  clientID: process.env.OAUTH_FACEBOOK_CLIENT_ID!,
  clientSecret: process.env.OAUTH_FACEBOOK_CLIENT_SECRET!,
  callbackURL: `${clientOrigin}/login/facebook/success`,
  scope: ["public_profile", "email"],
  passReqToCallback:true
};



function makeVerifyCb(provider: UserCreatedBy) {
    return async function (
    req:Request,
    accessToken: string,
    refreshToken: string,
    profile: MinimalProfile,
    done:VerifyCallback
  ) {
    try {
      const name = profile.displayName;
      const email = profile.emails?.[0]?.value;

      if (!email) return done(new Error("Email not provided"));

      //look for existing user by email
      let user = await prisma.user.findUnique({ where: { email } });

      //if user exists but OAuth not linked, link provider
      if (user && !user.providerId) {
        user = await prisma.user.update({
          where: { email },
          data: { providerId: profile.id },
        });
      }

      //if no user, create one
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            verified: true,
            providerId: profile.id,
            createdBy: provider,
          },
        });
      }
        
    req.oAuthUser = { user };

      done(null, false);
    } catch (err) {
      done(err);
    }
  };
}

passport.use(new GoogleStrategy(googleConfig, makeVerifyCb("GOOGLE")));
passport.use(new FacebookStrategy(facebookConfig, makeVerifyCb("FACEBOOK")));