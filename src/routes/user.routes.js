import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

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

export default router;