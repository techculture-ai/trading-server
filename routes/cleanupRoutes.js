import express from "express";
import { 
  cleanupTempFiles, 
  getUploadsStats, 
  cleanupAfterUpload 
} from "../utils/cleanupTempFiles.js";

const router = express.Router();

// GET /api/cleanup/stats - Get statistics about uploads directory
router.get("/stats", async (req, res) => {
  try {
    const stats = await getUploadsStats();
    res.json({
      success: true,
      data: stats,
      message: `Found ${stats.fileCount} files (${stats.totalSizeMB} MB)`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get uploads statistics",
      error: error.message
    });
  }
});

// POST /api/cleanup/manual - Manual cleanup trigger
router.post("/manual", async (req, res) => {
  try {
    const { maxAgeHours = 1 } = req.body;
    const result = await cleanupTempFiles(maxAgeHours);
    
    res.json({
      success: true,
      data: result,
      message: `Cleanup completed. Deleted ${result.deletedCount} files, freed ${(result.totalSize / 1024 / 1024).toFixed(2)} MB`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Manual cleanup failed",
      error: error.message
    });
  }
});

// POST /api/cleanup/force - Force cleanup all files (dangerous)
router.post("/force", async (req, res) => {
  try {
    const result = await cleanupTempFiles(0); // Delete all files regardless of age
    
    res.json({
      success: true,
      data: result,
      message: `Force cleanup completed. Deleted ${result.deletedCount} files, freed ${(result.totalSize / 1024 / 1024).toFixed(2)} MB`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Force cleanup failed",
      error: error.message
    });
  }
});

export default router;
