import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

//to be checked for exploration
app.use(cors({
	origin: process.env.CORS_ORIGIN,
	credentials: true
}))

//Configuration use() method is used in middleware
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from "./routes/user.routes.js"

//routes declaration
app.use("/api/v1/users", userRouter)  //used as prefix

export {app}