import { Router } from "express";
import {
  getLikedPhotos,
  togglePhotoLike,
} from "../controllers/like.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/p/:photoId").post(togglePhotoLike);
router.route("/photos").get(getLikedPhotos);

export default router;
