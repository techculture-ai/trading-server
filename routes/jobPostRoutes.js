import express from "express";
import {adminAuthorize,authenticateUser} from "../middlewares/authMiddleware.js"
import {createJobPost,deleteJobPost,editJobPost,getAllJobPosts,getJobPostById,getJobPostsByFilters} from "../controllers/jobPostController.js"
const router = express.Router();

router.post("/",authenticateUser,adminAuthorize,createJobPost);
router.get("/", getAllJobPosts);
router.get("/filter", getJobPostsByFilters);
router.get("/:jobId", getJobPostById);
router.put("/:jobId", authenticateUser, adminAuthorize, editJobPost);
router.delete("/:jobId", authenticateUser, adminAuthorize, deleteJobPost);

export default router;