import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema  = new Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
		index: true   //if you want to make it in searching
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true
	},
	fullname: {
		type: String,
		required: true,
		trim: true,
		index: true
	},
	avtaar: {
		type: String,  //cloudinary url
		required: true
	},
	coverImage: {
		type: String
	},
	watchHistor: [
		{
			type: Schema.Types.ObjectId,
			ref: "Video"
		}
	],
	password: {
		type: String,
		required: [true, 'Password is required']
	},
	refreshToken: {
		type: String
	},
}, 
{
	timestamps: true
})

//Pre is a Hook middleware in Mongoose (to be read)
userSchema.pre("save", async function (next) {
	if(!this.isModified("password")){
		return next();
	}
	this.password = await bcrypt.hash(this.password, 10)
	next()
})

//to check if password is correct by making your own method though mongoose
userSchema.methods.isPasswordCorrect = async function(password){
	return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
	return jwt.sign(
		{
			_id: this._id,
			email: this.email,
			username: this.username,
			fullname: this.fullname
		},
		process.env.ACCESS_TOKEN_SECRET,
		{
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY
		}
	)
}
userSchema.methods.generateRefreshToken = function(){
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY
		}
	)
}
export const User = mongoose.model("User", userSchema); 