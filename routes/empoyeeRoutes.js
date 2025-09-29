import express from "express";
import multer from "multer";
const router = express.Router();
import { adminAuthorize, authenticateUser } from "../middlewares/authMiddleware.js";

import {createEmployee,deleteEmployee,getAllEmployees,getEmployeeById,updateEmployee} from "../controllers/employeeController.js";

const upload = multer({ dest: 'uploads/' });

router.post("/", upload.single('file'), createEmployee);
router.get("/",  getAllEmployees);
router.get("/:id",  getEmployeeById);
router.put("/:id", upload.single('file'), updateEmployee);
router.delete("/:id",  deleteEmployee);

export default router;