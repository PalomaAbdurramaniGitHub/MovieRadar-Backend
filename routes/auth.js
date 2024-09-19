import express from "express";
import Login from "../controllers/auth.js";
import VerifySecretCode from "../middleware/secretCodeCheck.js";
const router = express.Router();

router.post("/login", Login);
router.post("/verify-secret-code", VerifySecretCode);

export default router;