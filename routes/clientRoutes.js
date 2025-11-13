import express from "express";
import multer from "multer";
const router = express.Router();
import { adminAuthorize, authenticateUser } from "../middlewares/authMiddleware.js";

import {
  uploadCSV,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  deleteMultipleClients,
  exportClientsToCSV,
  deleteAllClients,
  getClientStats,
  toggleReadStatus,
  downloadDuplicateFile,
} from "../controllers/clientController.js";

const upload = multer({ dest: "uploads/" });

// Upload CSV
router.post("/upload", upload.single("file"), uploadCSV);

// Get all clients with pagination and search
router.get("/", getAllClients);

// Get statistics
router.get("/stats", getClientStats);

// Export to CSV
router.get("/export", exportClientsToCSV);

router.get("/duplicates/:filename", downloadDuplicateFile);

// Get client by ID
router.get("/:id", getClientById);

// Update client
router.put("/:id", updateClient);

// Toggle read status
router.patch("/:id/read-status", toggleReadStatus); // Add this route

// Delete single client
router.delete("/:id", deleteClient);

// Delete multiple clients
router.post("/delete-multiple", deleteMultipleClients);

// Delete all clients (use with caution)
router.delete("/all/clear", deleteAllClients);

export default router;