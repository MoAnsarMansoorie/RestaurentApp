import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser";
import connectDb from "./config/connectDb.js";
import authRoute from "./routes/authRoute.js";
dotenv.config();

const app = express()

connectDb()

// middlewares
app.use(express.json())
app.use(cors())
app.use(cookieParser())

const PORT = process.env.PORT || 8080;

// api end-point
app.use("/api/v1/auth", authRoute)

// api end point
app.get("/", (req, res) => {
    res.send("Hello from server!")
})

app.listen(PORT, () => {
    console.log(`Server is running at port http://localhost:${PORT}`)
})
