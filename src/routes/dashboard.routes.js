import { Router } from "express";
import {
  getProfileStats,
  getProfilePhotos,
} from "../controllers/dashboard.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/stats").get(getProfileStats);
router.route("/photos").get(getProfilePhotos);

export default router;
