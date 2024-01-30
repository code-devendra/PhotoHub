import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);

router.route("/login").post(loginUser);

router.route("/refresh-token").post(refreshAccessToken);

// secured routes
router.use(verifyJWT);

router.route("/logout").post(logoutUser);

router.route("/change-password").patch(changeCurrentPassword);

router.route("/whoami").get(getCurrentUser);

router.route("/update-account").patch(updateAccountDetails);

router.route("/avatar").patch(upload.single("avatar"), updateUserAvatar);

router.route("/p/:username").get(getUserProfile);

export default router;
