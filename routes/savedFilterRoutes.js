import express from "express";
const router = express.Router();

import {
  getAllSavedFilters,
  getSavedFilterById,
  createSavedFilter,
  updateSavedFilter,
  deleteSavedFilter,
  incrementUsageCount,
} from "../controllers/savedFilterController.js";

// Get all saved filters
router.get("/", getAllSavedFilters);

// Get saved filter by ID
router.get("/:id", getSavedFilterById);

// Create new saved filter
router.post("/", createSavedFilter);

// Update saved filter
router.put("/:id", updateSavedFilter);

// Delete saved filter
router.delete("/:id", deleteSavedFilter);

// Increment usage count
router.post("/:id/use", incrementUsageCount);

export default router;
