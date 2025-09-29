import express from "express";
import {
    createFAQ,
    getAllFAQs,
    getActiveFAQs,
    getFAQById,
    updateFAQ,
    deleteFAQ,
    getFAQsByCategory,
    getFAQCategories
} from "../controllers/faqController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/public", getActiveFAQs);
router.get("/public/category/:category", getFAQsByCategory);
router.get("/categories", getFAQCategories);

// Protected routes (Admin only)
router.use(authenticateUser); // Apply authentication to all routes below

router.post("/", createFAQ);
router.get("/", getAllFAQs);
router.get("/:id", getFAQById);
router.put("/:id", updateFAQ);
router.delete("/:id", deleteFAQ);

export default router;
