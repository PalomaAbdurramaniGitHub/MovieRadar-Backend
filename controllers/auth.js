import User from "../models/User.js";
import StatusCode from "http-status-codes";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";

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

        const secretCode = crypto.randomInt(100000, 999999).toString();
        req.session = req.session || {};
        req.session.secretCode = secretCode;
        req.session.userId = user._id;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Your Login Secret Code',
            text: `Your secret code is: ${secretCode}`
        }

        await transporter.sendMail(mailOptions);
        return res.status(StatusCode.OK).json({ message: "Code sent to your email" });
    }catch(error){
        console.error("Error loging in:", error);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while trying to log in." });
    }
};

export default Login;