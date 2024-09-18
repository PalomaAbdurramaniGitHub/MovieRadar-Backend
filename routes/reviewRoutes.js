import express from "express";
import {
    getAllReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview
} from "../controllers/reviewController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllReviews);
router.get("/:id", getReviewById);
router.post("/", authenticateToken, createReview);
router.put("/:id", authenticateToken, updateReview);
router.delete("/:id", authenticateToken, deleteReview);

export default router;