import express, { type NextFunction ,type Request, type Response} from "express"
import dotenv from "dotenv"
import chalk from "chalk"
import { disconnectAllServices } from "./src/lib/disconnectHandler.js"

dotenv.config()
export const app = express()
const PORT = process.env.PORT

app.use(express.json())



export const server = app.listen(PORT, () => {
    console.log(chalk.green("Server running on Port: " + PORT))
})

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
