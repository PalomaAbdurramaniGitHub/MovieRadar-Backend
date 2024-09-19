import jwt from "jsonwebtoken";
import User from "../models/User.js";
import StatusCode from "http-status-codes";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const Login = async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        
        if(!user){
            return res.status(StatusCode.NOT_FOUND).json({message: "User not found"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(StatusCode.UNAUTHORIZED).json({ message: "Invalid credentials!" });
        }
        const token = jwt.sign({ id: user._id, name: user.name, email: user.email  }, process.env.JWT_SECRET);

        return res.status(StatusCode.OK).json({token, email});
    }catch(error){
        console.error("Error loging in:", error);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while trying to log in." });
    }
}

export default Login;