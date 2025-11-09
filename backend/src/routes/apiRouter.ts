import { Router } from "express";
import usersRouter from "./usersRouter.js";
import productsRouter from "./productsRouter.js";
import categoriesRouter from "./categoriesRouter.js";
import ordersRouter from "./ordersRouter.js";
import reviewsRouter from "./reviewsRouter.js";
import authRouter from "./authRouter.js";
import adminRouter from "./adminRouter.js";

const apiRouter = Router();

apiRouter.use("/users", usersRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/admin", adminRouter);

export default apiRouter;
 