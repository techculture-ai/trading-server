import express from "express"
import {adminAuthorize,authenticateUser} from "../middlewares/authMiddleware.js"
import {addTechnologyItem,createTechnology,deleteTechnology,deleteTechnologyItem,getAllTechnologies,getTechnologyByCategoryKey,getTechnologyById,searchTechnologies,updateTechnology,updateTechnologyItem} from "../controllers/tehnologiesController.js"

const router = express.Router();

// Routes for your technology controllers
router.post("/", createTechnology);
router.get("/", getAllTechnologies);
router.get("/:id", getTechnologyById);
router.get("/category/:categoryKey", getTechnologyByCategoryKey);
router.put("/:id", updateTechnology);
router.delete("/:id", deleteTechnology);
router.post("/:id/items", addTechnologyItem);
router.put("/:id/items/:itemId", updateTechnologyItem);
router.delete("/:id/items/:itemId", deleteTechnologyItem);
router.get("/search", searchTechnologies);

export default router;