import express from "express"
const router = express.Router()
import multer from "multer"
import {adminAuthorize,authenticateUser} from "../middlewares/authMiddleware.js"
import {adminloginUser,changePassword,forgotPassword, getAllUsers, getUserProfile, registerUser, updateUserProfile, verifyOtp} from "../controllers/userController.js"

const upload = multer({ dest: 'uploads/' })

router.post("/register", registerUser);
router.post("/login", adminloginUser);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.get("/all-users", authenticateUser, adminAuthorize, getAllUsers);
router.get("/", authenticateUser, getUserProfile);
router.put("/", authenticateUser, upload.single('file'), updateUserProfile);
router.put("/change-password", authenticateUser, changePassword);

export default router;