import { it, expect, describe } from "vitest";
import request from "supertest";
import express from "express";
import {
  isAdmin,
  isAuthenticated,
  hasRefreshToken,
  hasCsrfToken,
  verifyCaptcha,
  attachUserIfExists,
} from "../../src/middleware/authMiddleware.js";
import {
  authRateLimiter,
  geoCurrencyMiddleware,
} from "../../src/middleware/utilityMiddleware.js";
import { JWT_ACCESS_TOKEN_SECRET } from "../../src/config/env.js";
import jwt from "jsonwebtoken";

//should also test services like 3rd party apis, redis, prisma, turnstile etc. !!Dont Mock
 
describe("isAuthenticated Middleware", () => {
  const app = express()

  app.get("/test-auth", isAuthenticated, (req, res) => {
  return res.status(200).json({ user: req.user });
  });

  it("should return 401 if no token is provided", async () => {
    const res = await request(app).get("/test-auth");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User not logged in");
  });

  it("should return 200 and set req.user if a valid JWT is provided", async () => {
    const validPayload = { id: "user_123", role: "USER" };
    const token = jwt.sign(validPayload, JWT_ACCESS_TOKEN_SECRET);

    const res = await request(app)
      .get("/test-auth")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe("user_123");
  });

  it("should return 401 if the token is expired or tampered with", async () => {
    const fakeToken = jwt.sign({ id: "123" }, "WRONG_SECRET");

    const res = await request(app)
      .get("/test-auth")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(res.status).toBe(401);
  });
});


describe("isAdmin Middleware", () => {

  const app = express();
    app.get("/test-auth", isAdmin, (req, res) => {
      res.status(200).json({ user: req.user });
    });

});


describe("hasRefreshToken Middleware", () => {
  const app = express();
    app.get("/test-auth", hasRefreshToken, (req, res) => {
      res.status(200).json({ user: req.user });
    });

});


describe("hasCsrfToken Middleware", () => {
  const app = express();
    app.get("/test-auth", hasCsrfToken, (req, res) => {
      res.status(200).json({ user: req.user });
    });
});


describe("verifyCaptcha Middleware", () => {
  const app = express();
    app.get("/test-auth", verifyCaptcha, (req, res) => {
      res.status(200).json({ user: req.user });
    });
});


describe("attachUserIfExists Middleware", () => {
  const app = express();
    app.get("/test-auth", attachUserIfExists, (req, res) => {
      res.status(200).json({ user: req.user });
    });

});


describe("authRateLimiter Middleware", () => {
  const app = express();
    app.get("/test-auth", authRateLimiter, (req, res) => {
      res.status(200).json({ user: req.user });
    });
});


describe("geoCurrencyMiddleware Middleware", () => {
  const app = express();
    app.get("/test-auth", geoCurrencyMiddleware, (req, res) => {
      res.status(200).json({ user: req.user });
    });
});
