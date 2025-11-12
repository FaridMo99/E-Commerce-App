import { Router } from "express";
import stripeRouter from "./stripeRouter.js";

const webhookRouter = Router();

webhookRouter.use("/stripe", stripeRouter);

export default webhookRouter;
