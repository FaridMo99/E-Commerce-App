import { Router } from "express";
import bodyParser from "body-parser";
import { stripeHandler } from "../controller/stripeController.js";

const stripeRouter = Router()

stripeRouter.post("/", bodyParser.raw({type:"application/json"}),stripeHandler)

export default stripeRouter