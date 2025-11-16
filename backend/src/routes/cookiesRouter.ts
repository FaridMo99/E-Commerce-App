import { Router } from "express";
import { setCurrencyCookie } from "../controller/cookiesController.js";

const cookiesRouter = Router();

cookiesRouter.get("currency", setCurrencyCookie);

export default cookiesRouter;
