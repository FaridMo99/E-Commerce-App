import { it, expect, describe, beforeAll, afterAll } from "vitest";
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
  JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
} from "../../src/config/env.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

describe("isAuthenticated Middleware", () => {
  const app = express();

  app.get("/auth", isAuthenticated, (req, res) => {
    return res.status(200).json({ user: req.user });
  });

  it("should return 401 if no token is provided", async () => {
    const res = await request(app).get("/auth");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User not logged in");
  });

  it("should return 200 and set req.user if a valid JWT is provided", async () => {
    const validPayload = { id: "user_123", role: "USER" };
    const token = jwt.sign(validPayload, JWT_ACCESS_TOKEN_SECRET);

    const res = await request(app)
      .get("/auth")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe("user_123");
  });

  it("should return 401 if the token is expired or tampered with", async () => {
    const fakeToken = jwt.sign({ id: "123" }, "WRONG_SECRET");

    const res = await request(app)
      .get("/auth")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(res.status).toBe(401);
  });
});

describe("isAdmin Middleware", () => {
  const app = express();
  app.get("/admin", isAuthenticated, isAdmin, (req, res) => {
    res.status(200).json({ user: req.user });
  });

  it("should return 403 if user role is not ADMIN", async () => {
    const validPayloadWrongRole = { id: "user_123", role: "USER" };
    const token = jwt.sign(validPayloadWrongRole, JWT_ACCESS_TOKEN_SECRET);

    const res = await request(app)
      .get("/admin")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("User not authorized");
  });

  it("should return 200 if user role is ADMIN", async () => {
    const validPayload = { id: "user_123", role: "ADMIN" };
    const token = jwt.sign(validPayload, JWT_ACCESS_TOKEN_SECRET);

    const res = await request(app)
      .get("/admin")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

describe("hasRefreshToken Middleware", () => {
  const app = express();
  app.use(cookieParser());
  app.get("/refresh", hasRefreshToken, (req, res) => {
    res.status(200).json({ user: req.user });
  });

  it("should return 401 if no refresh token cookie is present", async () => {
    const res = await request(app).get("/refresh");
    expect(res.status).toBe(401);
  });

  it("should return 200", async () => {
    const payload = { id: "user_123" };
    const token = jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET);

    const res = await request(app)
      .get("/refresh")
      .set("Cookie", [`refreshToken=${token}`]);

    expect(res.status).toBe(200);
  });
});

describe("hasCsrfToken Middleware", () => {
  const app = express();
  app.use(cookieParser());
  app.get("/csrf", hasCsrfToken, (req, res) => {
    res.status(200).json({ user: req.user });
  });

  it("should return 401 if header and cookie do not match", async () => {
    const res = await request(app)
      .get("/csrf")
      .set("x-csrf-token", "token-a")
      .set("Cookie", ["csrfToken=token-b"]);

    expect(res.status).toBe(401);
  });

  it("should return 200 if header and cookie match", async () => {
    const res = await request(app)
      .get("/csrf")
      .set("x-csrf-token", "secure-token")
      .set("Cookie", ["csrfToken=secure-token"]);

    expect(res.status).toBe(200);
  });
});

describe("verifyCaptcha Middleware", () => {
  const app = express();
  app.get("/captcha", verifyCaptcha, (req, res) => {
    res.status(200).json({ user: req.user });
  });

  it("should return 404 if token is missing", async () => {
    const res = await request(app).post("/captcha");
    expect(res.status).toBe(404);
  });

  it("should return 404 if token is invalid/fake", async () => {
    const res = await request(app)
      .post("/captcha")
      .set("x-cf-turnstile-token", "invalid-token");

    expect(res.status).toBe(404);
  });
});

describe("attachUserIfExists Middleware", () => {
  const app = express();
  app.get("/user", attachUserIfExists, (req, res) => {
    res.status(200).json({ user: req.user });
  });

  it("should proceed but not set req.user if no token provided", async () => {
    const res = await request(app).get("/user");
    expect(res.status).toBe(200);
    expect(res.body.user).toBeUndefined();
  });

  it("should set req.user if a valid token is provided", async () => {
    const token = jwt.sign(
      { id: "789", role: "USER" },
      JWT_ACCESS_TOKEN_SECRET,
    );
    const res = await request(app)
      .get("/user")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe("789");
  });
});
