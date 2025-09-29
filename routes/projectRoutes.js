import express from "express";
import multer from "multer";
import {adminAuthorize,authenticateUser} from "../middlewares/authMiddleware.js"
import {createProject,deleteProject,getAllProjects,getProjectById,updateProject,createCategory,deleteCategory,getAllCategories,getCategoryById,getProjectsByCategory,updateCategory,getProjectBySlug, getProjectsByCategorySlug} from "../controllers/projectController.js"

const router = express.Router();
const upload = multer({dest: "uploads/"});

// Configure multer to handle multiple files
const uploadFields = upload.fields([
  { name: 'file', maxCount: 1 }, // Main project image
  { name: 'portfolioImages', maxCount: 10 }, // Portfolio images (max 10) 
]);

// Category routes (must be before project routes with /:id to avoid conflicts)
router.post("/category", authenticateUser, adminAuthorize, upload.single('file'), createCategory);
router.get("/category", getAllCategories);
router.get("/category/:categoryId", getProjectsByCategory);
router.put("/category/:id", authenticateUser, adminAuthorize, upload.single('file'), updateCategory);
router.delete("/category/:id", authenticateUser, adminAuthorize, deleteCategory);
router.get("/category-slug/:slug", getProjectsByCategorySlug);
// Project routes
router.post("/", authenticateUser, adminAuthorize, uploadFields, createProject);
router.get("/", getAllProjects);
router.get("/slug/:slug", getProjectBySlug);
router.get("/:id", getProjectById);
router.put("/:id", authenticateUser, adminAuthorize, uploadFields, updateProject);
router.delete("/:id", authenticateUser, adminAuthorize, deleteProject);


export default router;