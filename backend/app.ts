import express from "express"
import dotenv from "dotenv"
import chalk from "chalk"

dotenv.config()
const app = express()
const PORT = process.env.PORT

app.use(express.json())



app.listen(PORT, () => {
    console.log(chalk.green("Server running on Port: " + PORT))
})