import { Router } from "express";
import { logoutUser,loginUser, registerUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvtaar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
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
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avtaar").patch(verifyJWT, upload.single("avtaar"), updateUserAvtaar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/channel-profile/:username").get(verifyJWT, getUserChannelProfile)
router.route("watch-history").get(verifyJWT, getWatchHistory)

export default router;