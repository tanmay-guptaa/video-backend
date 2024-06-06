import { Router } from "express";
import { logoutUser,loginUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//Note: injecting multer middleware in register route to add avtaar and cover image it uses field() which is middleware function
//as we cannot send image directly that's why we inject this here
router.route("/register").post(
	upload.fields([
		{
			name: "avtaar",
			maxCount: 1
		},
		{
			name: "coverImage",
			maxCount: 1
		}
	]),
	registerUser
	)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router;