import express from "express";
import {adminAuthorize,authenticateUser} from "../middlewares/authMiddleware.js";

import {createContact,deleteContact,getAllContacts,getContactById,updateContact} from "../controllers/contactController.js"

const router = express.Router();

router.post("/", createContact);
router.get("/",authenticateUser,adminAuthorize, getAllContacts);
router.get("/:id", authenticateUser, adminAuthorize, getContactById);
router.delete("/:id", authenticateUser, adminAuthorize, deleteContact);
router.put("/:id", authenticateUser, adminAuthorize, updateContact);

export default router;
