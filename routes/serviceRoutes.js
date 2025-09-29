import express from "express";
import multer from "multer";
import {adminAuthorize,authenticateUser} from "../middlewares/authMiddleware.js"
import {createService,deleteService,getAllServices,getServiceById,updateService,getServiceBySlug} from "../controllers/serviceController.js"

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const uploadFields = upload.fields([
  { name: "file", maxCount: 1 }, // Main project image
  { name: "sliderImage", maxCount: 10 }, // Slider images (max 10)
]);

router.post("/", authenticateUser, adminAuthorize, uploadFields, createService);
router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.get("/slug/:slug", getServiceBySlug);
router.put("/:id", authenticateUser, adminAuthorize, uploadFields, updateService);
router.delete("/:id", authenticateUser, adminAuthorize, deleteService);

export default router;