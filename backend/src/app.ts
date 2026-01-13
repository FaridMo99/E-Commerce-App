import "./config/constants.js";
import "./config/env.js";
import "./services/redis.js";
import "./services/prisma.js";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import chalk from "chalk";
import { disconnectAllServices } from "./lib/disconnectHandler.js";
import cookieParser from "cookie-parser";
import apiRouter from "./routes/apiRouter.js";
import passport from "./services/passport.js";
import { CLIENT_ORIGIN, NODE_ENV, PORT } from "./config/env.js";
import "./services/cronJobs.js";
import webhookRouter from "./routes/webhooks/webhookRouter.js";
import cors from "cors";
import { loggerMiddleware } from "./middleware/utilityMiddleware.js";
import { getTimestamp } from "./lib/utils.js";

export const app = express();

//proxy support middleware to access ip
app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);

app.use(loggerMiddleware);

app.use(
  cors({
    origin: [CLIENT_ORIGIN],
    credentials: true,
  }),
);

//middleware to parse form submits to req.body
app.use(express.urlencoded({ extended: true }));

//middleware to parse application/json to req.body
app.use((req, res, next) => {
  if (req.originalUrl === "/webhooks/stripe") return next();
  express.json()(req, res, next);
});

//middleware to parse cookies to req.cookie, jwt is inside req.cookie.jwt
app.use(cookieParser());

//passport for oauth
app.use(passport.initialize());

//route handlers
app.use("/api", apiRouter);
app.use("/webhooks", webhookRouter);

export const server = app.listen(PORT, async () => {
  console.log(chalk.green(`${getTimestamp()} Server running on Port:${PORT}`));
});

//global error middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (NODE_ENV === "dev") {
    console.log(chalk.magenta(err.stack));
  }

  console.log(chalk.red(`${getTimestamp()} Global error: ${err}`));
  return res.status(500).json({ error: "Something went wrong" });
});

//process crash handler
process.on("uncaughtException", async (err: Error) => {
  await disconnectAllServices("Uncaught Exception:", server, err);
});
process.on("unhandledRejection", async (err: Error) => {
  await disconnectAllServices("Unhandled Rejection:", server, err);
});
process.on("SIGINT", async () => {
  await disconnectAllServices("SIGINT", server);
});
process.on("SIGTERM", async () => {
  await disconnectAllServices("SIGTERM", server);
});

process.on("exit", (code) => {
  console.log(chalk.red(getTimestamp(), `Process exited with code: ${code}`));
});
