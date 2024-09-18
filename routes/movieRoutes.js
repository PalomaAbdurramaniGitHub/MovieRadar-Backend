import express from "express";
import {
    getAllMovies,
    getMovieById,
    findMovieByTitle,
    createMovie,
    updateMovie,
    deleteMovie,
    getFilteredMovies
} from "../controllers/movieController.js";
import upload from "../middleware/uploadMiddleware.js";
import authenticateToken from "../middleware/authMiddleware.js";
import authorizeAdmin from "../middleware/authorize.js";

const router = express.Router();

router.get("/", getAllMovies, getFilteredMovies);
router.get("/search", findMovieByTitle);
router.get("/:id", getMovieById);
router.post("/", authenticateToken, authorizeAdmin(), upload.single('poster'), createMovie);
router.put("/:id", authenticateToken, authorizeAdmin(), upload.single('poster'), updateMovie);
router.delete("/:id", authenticateToken, authorizeAdmin(), deleteMovie);

export default router;