import jwt from "jsonwebtoken";
import User from "../models/User.js";
import StatusCode from "http-status-codes";
import dotenv from "dotenv";

dotenv.config();

const VerifySecretCode = async (req, res) => {
    const {code} = req.body;
    try {
        if(req.session.secretCode === code){
            const user = await User.findById(req.session.userId);
            const token = jwt.sign({id: user._id, name: user.name, email: user.email}, process.env.JWT_SECRET);

            delete req.session.secretCode;
            delete req.session.userId;
            return res.status(StatusCode.OK).json({ token, email: user.email });
        } else {
            return res.status(StatusCode.UNAUTHORIZED).json({ message: "Invalid secret code" });
        }
    } catch (error) {
        console.error("Error verifying secret code:", error);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while verifying the code." });
    }
};

export default VerifySecretCode;