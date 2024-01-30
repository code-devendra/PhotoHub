import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  getAllPhotos,
  createPhoto,
  getPhotoById,
  deletePhoto,
  updatePhoto,
  togglePublicStatus,
} from "../controllers/photo.controllers.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes of this file

router.route("/").get(getAllPhotos).post(upload.single("photo"), createPhoto);

router
  .route("/:photoId")
  .get(getPhotoById)
  .delete(deletePhoto)
  .patch(upload.single("photo"), updatePhoto);

router.route("/toggle/public/:photoId").patch(togglePublicStatus);

export default router;
