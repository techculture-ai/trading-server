import express from "express";
import multer from "multer";
import {adminAuthorize,authenticateUser} from "../middlewares/authMiddleware.js"
import {createTestimonial,deleteTestimonial,editTestimonial,getAllTestimonials,getTestimonialById} from "../controllers/testimonialController.js"

const router = express.Router();
const upload = multer({dest: "uploads/"});

// Configure multer to handle multiple files with specific field names
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'backgroundImage', maxCount: 1 }
]);

router.post("/", uploadFields, createTestimonial);
router.get("/", getAllTestimonials);
router.get("/:id", getTestimonialById);
router.delete("/:id", deleteTestimonial);
router.put("/:id", uploadFields, editTestimonial);

export default router;
