import express, { type NextFunction ,type Request, type Response} from "express"
import dotenv from "dotenv"
import chalk from "chalk"
import { disconnectAllServices } from "./src/lib/disconnectHandler.js"
import usersRouter from "./src/routes/usersRouter.js"
import productsRouter from "./src/routes/productsRouter.js"
import categoriesRouter from "./src/routes/categoriesRouter.js"
import ordersRouter from "./src/routes/ordersRouter.js"
import reviewsRouter from "./src/routes/reviewsRouter.js"
import authRouter from "./src/routes/authRouter.js"
import adminRouter from "./src/routes/adminRouter.js"
import cookieParser from "cookie-parser"
dotenv.config()

export const app = express()
const PORT = process.env.PORT


//middleware to parse form submits to req.body
app.use(express.urlencoded({ extended: true }))

//middleware to parse application/json to req.body
app.use(express.json())

//middleware to parse cookies to req.cookie, jwt is inside req.cookie.jwt
app.use(cookieParser())

//route handlers
app.use("/users", usersRouter)
app.use("/products", productsRouter);
app.use("/categories", categoriesRouter);
app.use("/orders", ordersRouter);
app.use("/reviews", reviewsRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);



export const server = app.listen(PORT, () => {
  console.log(chalk.green("Server running on Port: " + PORT))
})


//global error middleware
app.use((err:Error, req:Request, res:Response, next:NextFunction) => {
    console.log(chalk.red("Global error: " + err))
      return res.status(500).json({ error: "Something went wrong" });
})

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
