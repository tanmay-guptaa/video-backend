import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
	try {
		const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
		console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`); //to be check
	} catch (error) {
		console.log("MongoDB connection FAILED", error);
		process.exit(1);  //to be read
	}
}

export default connectDB;
