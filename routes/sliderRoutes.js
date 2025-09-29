import express from "express";
import {adminAuthorize,authenticateUser} from "../middlewares/authMiddleware.js";
import {createSlider,deleteSlider,editSlider,getAllSliders,getSliderById} from "../controllers/sliderController.js"
import multer from "multer";

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post("/", upload.single("file"), createSlider);
router.get("/", getAllSliders);
router.get("/:id", getSliderById);
router.put("/:id", upload.single("file"), editSlider);
router.delete("/:id", deleteSlider);

export default router;