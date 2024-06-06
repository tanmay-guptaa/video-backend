import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId) =>{
	try {
		const user         = await User.findById(userId);
		const accessToken  = user.generateAccessToken()
		const refreshToken = user.generateRefreshToken()

		user.refreshToken  = refreshToken
		await user.save({ validateBeforeSave: false })

		return {accessToken, refreshToken}
	} catch (error) {
		throw new ApiError(500, "Something went wrong while generating tokens");
	}
}

const registerUser = asyncHandler( async (req, res) => {
	/*  get user details from frontend
		validation - not empty
		check if user already exist: username and email both
		check for images, check for avtaar
		upload them to cloudinary, avtaar
		create user object - create entry in db
		remove password and refresh token field from response
		check for user creation if created then return response
	*/

	const {fullname, email, username, password} = req.body //to get data from request
	console.log("email", email);

    /*1st approach to check validation
		if(fullname == "") {
			throw new ApiError(400, "Full Name is required")
		}
	*/

	//2nd approach to check validation
	if([fullname, email, username, password].some((field) => field?.trim() ==="")) {
		throw new ApiError(400, "All fields are required")
	}

	//check if user already present in database or not
	const existedUser = await User.findOne({
		$or: [{username}, {email}]
	})

	if(existedUser) {
		throw new ApiError(409, "User already exist")
	}

	const avtaarLocalPath      = req.files?.avtaar[0]?.path;
	//const coverImageLocalPath  = req.files?.coverImage[0]?.path;

	let coverImageLocalPath;
	if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
		coverImageLocalPath = req.files.coverImage[0].path;
	}
	console.log("avtaar", avtaarLocalPath);

	if(!avtaarLocalPath) {
		throw new ApiError(400, "Avtaar file is required")
	}

	const avtaar     = await uploadOnCloudinary(avtaarLocalPath);
	const coverImage = await uploadOnCloudinary(coverImageLocalPath);

	if(!avtaar) {
		throw new ApiError(400, "Avtaar file is required")
	}

	const user = await User.create({
		fullname,
		avtaar: avtaar.url,
		coverImage: coverImage?.url || "",
		email,
		password,
		username: username.toLowerCase()
	})

    //removing password and refresh token fields
	const createdUser = await User.findById(user._id).select(
		"-password -refreshToken"
	)

	if(!createdUser) {
		throw new ApiError(500, "User already exist");
	}

	return res.status(201).json(
		new ApiResponse(200, createdUser, "User registered Successfully")
	)
})

const loginUser = asyncHandler(async (req, res) =>{
	/*req body => data
	  username or email
	  find the user
	  password check
	  access and refresh token to be generate if password is checked
	  send these tokens though cookies 
	*/

	const {email, username, password} = req.body;

	if(!username && !email) {
		throw new ApiError(400, "username or email is required");
	}

    /*alternative of the above code
	if(!(username || email) {
		throw new ApiError(400, "username or email is required");
	}*/

	const user = await User.findOne({
		$or: [{username}, {email}]
	})

	if(!user) {
		throw new ApiError(404, "User does not exist");
	}

    //the function isPasswordCorrect comes from User Model
	const isPasswordValid = await user.isPasswordCorrect(password)

	if(!isPasswordValid) {
		throw new ApiError(401, "Invalid user credentials");
	}

	const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    //optional step 
	const loggedInUser = await User.findById(user._id).select("-password", "-refreshToken")

    //These are set in cookies as cookies are modifiable in frontend so to stop that we use these options below
	const options = {
		httpOnly: true,
		secure: true
	}

	return res
	.status(200)
	.cookie("accessToken", accessToken, options)
	.cookie("refreshToken", refreshToken, options)
	.json(
		new ApiResponse(
			200,
			{
				user: loggedInUser, accessToken, refreshToken
			},
			"User Logged In Successfully"
		)
	)
})

const logoutUser = asyncHandler(async(req, res) => {
	/*
	  remove cookies when user log out 
	  reset refreshToken in database
	*/
	await User.findByIdAndUpdate(
		req.user._id,
		{
			$set: {
				refreshToken: undefined
			}
		},
		{
			new: true
		}
	)

	const options = {
		httpOnly: true,
		secure: true
	}

	return res
	.status(200)
	.clearCookie("accessToken", options)
	.clearCookie("refreshToken", options)
	.json(new ApiResponse(200, {}, "User Logged Out Successfully"))
})

//making endpoint of refresh token
const refreshAccessToken = asyncHandler(async(req, res) => {
	const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

	if(!incomingRefreshToken) {
		throw new ApiError(401, "Unauthorized Request")
	}

    try {
		const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

		const user = await User.findById(decodedToken?._id)

		if(!user) {
			throw new ApiError(401, "Invalid Refresh Token")
		}

		if(incomingRefreshToken !== user?.refreshToken){
			throw new ApiError(401, "Refresh Token is expired or used")
		}

		const options = {
			httpOnly: true,
			secure: true
		}

		const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

		return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", newRefreshToken, options)
		.json(
			new ApiResponse(
				200,
				{accessToken, newRefreshToken},
				"Accces Token Refreshed Successfully"
			)
		)
    } catch (error) {
    	throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

export {registerUser, loginUser, logoutUser, refreshAccessToken}