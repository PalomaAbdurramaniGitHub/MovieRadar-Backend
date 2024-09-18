import express from "express";
import {
    getAllUsers,
    getUserById,
    signup,
    updateUser,
    updateUserEmail,
    updateUserPassword,
    deleteUser,
} from "../controllers/userController.js";
import checkAgeForRegistration from "../middleware/checkUserAge.js";
import authenticateToken from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import authorizeAdmin from "../middleware/authorize.js";

const router = express.Router();

router.get("/", authenticateToken, authorizeAdmin(), getAllUsers);
router.get("/me", authenticateToken, getUserById);
router.post("/signup", checkAgeForRegistration, signup);
router.put("/me", authenticateToken, upload.single('photo'), updateUser);
router.put("/changeEmail", authenticateToken, updateUserEmail);
router.put("/changePassword", authenticateToken, updateUserPassword);
router.delete("/me", authenticateToken, deleteUser);

export default router;