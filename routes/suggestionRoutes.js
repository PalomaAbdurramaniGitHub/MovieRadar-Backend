import express from "express";
import {
    getAllSuggestions,
    getSuggestionById,
    createSuggestion,
    updateSuggestion,
    deleteSuggestion
} from "../controllers/suggestionController.js";
import generateSuggestions from "../middleware/generateSuggestions.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getSuggestionById);
router.post("/generate", authenticateToken, generateSuggestions);
router.post("/", authenticateToken, createSuggestion);
router.put("/:id", authenticateToken, updateSuggestion);
router.delete("/:id", authenticateToken, deleteSuggestion);

export default router;