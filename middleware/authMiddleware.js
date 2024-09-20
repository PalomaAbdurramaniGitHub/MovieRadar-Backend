import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import dotenv from "dotenv";

dotenv.config();

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token is missing from Authorization header." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "User not found." });
        }

        next();
    } catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid or expired token." });
    }
};

export default authenticateToken;