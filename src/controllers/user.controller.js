import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export {registerUser}