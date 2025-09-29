import express from "express";
import {
  getSiteSetting,
  updateSiteSetting,
} from "../controllers/siteSettingController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getSiteSetting);
router.put("/", upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "clients", maxCount: 50 } // increased from 15 to 50
  ]), updateSiteSetting);

export default router;