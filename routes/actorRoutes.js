import express from "express";
import {
    getAllActors,
    getActorById,
    findActorByName,
    createActor,
    updateActor,
    deleteActor
} from "../controllers/actorController.js";
import authenticateToken from "../middleware/authMiddleware.js";
import authorizeAdmin from "../middleware/authorize.js";

const router = express.Router();

router.get("/", getAllActors);
router.get("/search", findActorByName);
router.get("/:id", getActorById);
router.post("/", authenticateToken, authorizeAdmin(), createActor);
router.put("/:id", authenticateToken, authorizeAdmin(), updateActor);
router.delete("/:id", authenticateToken, authorizeAdmin(), deleteActor);

export default router;