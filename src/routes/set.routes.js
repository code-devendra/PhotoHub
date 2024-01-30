import { Router } from "express";
import {
  addPhotoToSet,
  createSet,
  deleteSet,
  getSetById,
  getUserSets,
  removePhotoFromSet,
  updateSet,
} from "../controllers/set.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createSet);

router.route("/:setId").get(getSetById).patch(updateSet).delete(deleteSet);

router.route("/add/:photoId/:setId").patch(addPhotoToSet);
router.route("/remove/:photoId/:setId").patch(removePhotoFromSet);

router.route("/user/:userId").get(getUserSets);

export default router;
