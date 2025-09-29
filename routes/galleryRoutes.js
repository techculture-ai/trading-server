import express from "express";
const router = express.Router();
import multer from "multer";

import {createGalleryController,deleteGalleryImage,getAllGallery,getGalleryById,updateGalleryImage} from "../controllers/galleryController.js";
import {adminAuthorize,authenticateUser} from "../middlewares/authMiddleware.js"

const upload = multer({ dest: "uploads/" });

router.post("/", authenticateUser, adminAuthorize, upload.single("file"), createGalleryController);
router.get("/", getAllGallery);
router.get("/:id", getGalleryById);
router.put("/:id", authenticateUser, adminAuthorize, upload.single("file"), updateGalleryImage);
router.delete("/:id", authenticateUser, adminAuthorize, deleteGalleryImage);

export default router;
