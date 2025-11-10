import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import chalk from "chalk";
import { disconnectAllServices } from "./src/lib/disconnectHandler.js";
import cookieParser from "cookie-parser";
import apiRouter from "./src/routes/apiRouter.js";
import webhookRouter from "./src/routes/webhookRouter.js";
import passport from "passport";
import { PORT } from "./src/config/env.js";

export const app = express();

//proxy support middleware to access ip
app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);


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
app.use(passport.initialize())

//route handlers
app.use("/api", apiRouter);
app.use("/webhooks", webhookRouter);

//add another handler here for webapp serving

export const server = app.listen(PORT, () => {
  console.log(chalk.green("Server running on Port: " + PORT));
});

//global error middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(chalk.red("Global error: " + err));
  return res.status(500).json({ error: "Something went wrong" });
});

//process crash handler
process.on("uncaughtException", async (err: Error) => {
  await disconnectAllServices("Uncaught Exception:", err);
});
process.on("unhandledRejection", async (err: Error) => {
  await disconnectAllServices("Unhandled Rejection:", err);
});
process.on("SIGINT", async () => {
  await disconnectAllServices("SIGINT");
});
process.on("SIGTERM", async () => {
  await disconnectAllServices("SIGTERM");
});
