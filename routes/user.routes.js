import express from 'express';
import { registerUser, loginUser, logoutUser, getCurrentUser } from '../controller/user.controller.js'; // Adjust path to your controller
import { isAdmin, verifyJWT } from "../middleware/authmiddleware.js";

const router = express.Router(); // Correctly initialize the router

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
// router.route("/refresh-token").post(refreshAccessToken);
// router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/getuser").get(verifyJWT, getCurrentUser);

export default router;
