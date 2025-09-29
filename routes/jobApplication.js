import express from "express";
import { adminAuthorize, authenticateUser } from "../middlewares/authMiddleware.js";
import multer from "multer";
import {createJobApplication,deleteJobApplication,editJobApplication,getAllJobApplications,getJobApplicationById,getJobApplicationsByFilters} from "../controllers/jobApplicationController.js"

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), createJobApplication);
router.get("/", authenticateUser, adminAuthorize, getAllJobApplications);
router.get("/filters", authenticateUser, adminAuthorize, getJobApplicationsByFilters);
router.get("/:jobId", getJobApplicationById);
router.put("/:id", authenticateUser, adminAuthorize, editJobApplication);
router.delete(
  "/:id",
  authenticateUser,
  adminAuthorize,
  deleteJobApplication
);

export default router;