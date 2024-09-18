import express from "express";
import {
    getAllDirectors,
    getDirectorById,
    findDirectorByName,
    createDirector,
    updateDirector,
    deleteDirector
} from "../controllers/directorController.js";
import authenticateToken from "../middleware/authMiddleware.js";
import authorizeAdmin from "../middleware/authorize.js";

const router = express.Router();

router.get("/", getAllDirectors);
router.get("/search", findDirectorByName);
router.get("/:id", getDirectorById);
router.post("/", authenticateToken, authorizeAdmin(), createDirector);
router.put("/:id", authenticateToken, authorizeAdmin(), updateDirector);
router.delete("/:id", authenticateToken, authorizeAdmin(), deleteDirector);

export default router;