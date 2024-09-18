import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

// Send email
const sendEmail = async (userEmail, userName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: "Welcome to MovieRadar",
            text: `Hello ${userName},
            \n\nWelcome to MovieRadar! We're thrilled to have you join our community of movie enthusiasts. Get ready to explore a world of amazing films tailored just for you.
            \nIf you ever need any help or have questions, we're here for you. Dive in and discover your next favorite movie!
            \n\nHappy Watching,
            \nThe MovieRadar Team 🎥🍿`
        };
        await transporter.sendMail(mailOptions);
        console.log("Welcome email sent successfully.");
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

// POST - signup (create a new user)
const signup = async (req, res) => {
    const { 
        name, 
        email, 
        password, 
        confirmPassword,
        birthdate
    } = req.body;

    try {
        if (!process.env.EMAIL || !process.env.PASSWORD) {
            console.error("Email or Password environment variables are not set.");
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Email server configuration error." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({ message: "User already exists!" });
        }

        if(password === confirmPassword){
             // Create a new user
            const user = new User({
                name,
                email,
                password: password,
                birthdate,
                keepMeLogged: false,
                createdAt: new Date(),
                lastModified: new Date(),
                lastLogIn: new Date(),
                passwordChangedAt: null
            });

            await user.save();
            await sendEmail(email, name);
            res.status(StatusCodes.CREATED).json({ message: 'Sign-in successful, welcome email sent' });
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({message: "The passwords aren't correct."});
        } 
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "The server encountered an error and could not complete your request." });
    }
};

//GET - all
const getAllUsers = async (req, res) =>{
    try {
        const users = await User.find();
        res.status(StatusCodes.OK).json(users);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
//GET - one using ID
const getUserById = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found!" });
        }

        user.lastModified = Date.now();
        res.status(StatusCodes.OK).json(user);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "The server encountered an error and could not complete your request." });
    }
};

//PUT - update or create if the ID doesnot exist
const updateUser = async (req, res) => {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const existingUser = await User.findById(req.user._id);
        if (!existingUser) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
        }

        let profilePhotoPath;
        if(req.file){
            profilePhotoPath = `uploads/${req.file.filename}`;
            if(existingUser.profilePhoto){
                const oldPhotoPath = path.join(__dirname, "..", existingUser.profilePhoto);
                if(fs.existsSync(oldPhotoPath)){
                    fs.unlinkSync(oldPhotoPath);
                }
            }
        }

        const updateData = {
            ...req.body,
            ...(profilePhotoPath && {profilePhoto: profilePhotoPath}),
            lastModified: Date.now()
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            {new: true, runValidators: true}
        );

        if (updatedUser) {
            return res.status(StatusCodes.OK).json(updatedUser);
        } else {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "The server encountered an error and could not complete your request." });
    }
};

const updateUserEmail = async (req, res) => {
    try {
        const existingUser = await User.findById(req.user._id);
        const password = (req.body.password);
        const email = (req.body.email);
        if (!existingUser) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if(isMatch){
            const updatedUser = await User.findByIdAndUpdate(
                req.user._id,
                { email, lastModified: Date.now() }
            );
    
            if (updatedUser) {
                return res.status(StatusCodes.OK).json(updatedUser);
            } else {
                return res.status(StatusCodes.NOT_FOUND).json({ message: "User not updated." });
            }
        } else {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Incorrect password" });
        }
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "The server encountered an error and could not complete your request." });
    }
};
const updateUserPassword = async (req, res) => {
    try {
        const existingUser = await User.findById(req.user._id);
        const { currentPassword, password, confirmPassword } = req.body;

        if (!existingUser) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, existingUser.password);
        if (!isMatch) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Incorrect current password" });
        }

        if (password !== confirmPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "New password and confirmation do not match" });
        }
        if (password.length < 5) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Password too short." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { password: hashedPassword, lastModified: Date.now() },
            { new: true }
        );

        if (updatedUser) {
            return res.status(StatusCodes.OK).json(updatedUser);
        } else {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not updated." });
        }
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "The server encountered an error and could not complete your request." });
    }
};

// DELETE - delete user using token-based user ID
const deleteUser = async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Password is required." });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found!" });
        }


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Password is incorrect." });
        }

        const deletedUser = await User.findByIdAndDelete(req.user._id);
        if (deletedUser) {
            return res.status(StatusCodes.OK).json({ message: "User deleted successfully!"});
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "User could not be deleted." });
        }
    } catch (error) {
        console.error("An error occurred: ", error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "The server encountered an error and could not complete your request." });
    }
};

//Export all functions
export {getAllUsers, getUserById, signup, updateUser, updateUserEmail, updateUserPassword, deleteUser};