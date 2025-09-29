import express from "express"
const router = express.Router()

import {createEnquiryController,deleteEnquiryController,getAllEnquiriesController,getEnquiryByIdController,updateEnquiryController} from "../controllers/enquiryController.js"
import {adminAuthorize,authenticateUser} from "../middlewares/authMiddleware.js"

router.post("/", createEnquiryController);
router.get("/", authenticateUser,adminAuthorize, getAllEnquiriesController);
router.get("/:id", authenticateUser,adminAuthorize, getEnquiryByIdController);
router.delete("/:id", authenticateUser,adminAuthorize, deleteEnquiryController);
router.put("/:id", authenticateUser,adminAuthorize, updateEnquiryController);
export default router;
