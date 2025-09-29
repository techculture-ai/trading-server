import express from "express";
import {createCustomer,deleteCustomerById,getAllCustomers,getCustomerById,updateCustomerById} from "../controllers/customerController.js"
import multer from "multer";
import {adminAuthorize,authenticateUser} from "../middlewares/authMiddleware.js"

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/", upload.single("file"), createCustomer);
router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", upload.single("file"), updateCustomerById);
router.delete("/:id", deleteCustomerById);

export default router;
