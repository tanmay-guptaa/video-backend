// require('dotenv').config({path: './env'});
import dotenv from "dotenv";
import connectDB from "./db/index.js";

//configure .env
dotenv.config({
	path: './env'
})
connectDB()
.then(() => {
	app.listen(process.env.PORT || 8000, () => {
		console.log(`Server is running at port : ${process.env.PORT}`);
	})
})
.catch((err) => {
	console.log("MongoDB connection Failed", err);
})


//1st Approach to connect mongo database
/*import express from "express";
const app = express()

( async () => {
	try {
		await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
		app.on("error",(error) => {
			console.log("Error:", error);
			throw error
		})

		app.listen(process.env.PORT, () => {
			console.log(`App listens on ${process.env.PORT}`);
		})

	} catch (error) {
		console.error("Error:", error)
		throw error
	}
})()*/