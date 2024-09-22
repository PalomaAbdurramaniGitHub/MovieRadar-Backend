import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import nodemailer from "nodemailer";
import crypto from "crypto";

dotenv.config();

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

const sendVerificationEmail = async (userEmail, userName, verificationCode) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: "MovieRadar - Verification Code",
            text: `Hello ${userName},
            \n\nPlease use the following verification code to complete your registration on MovieRadar: ${verificationCode}
            \n\nThis code will expire in 10 minutes.
            \n\nThank you for joining MovieRadar!
            \nThe MovieRadar Team 🎥🍿`
        };
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully.");
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};
const generateVerificationCode = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// POST - signup (create a new user and send verification code)
const signup = async (req, res) => {
    const { name, email, password, confirmPassword, birthdate } = req.body;

    try {
        if (!process.env.EMAIL || !process.env.PASSWORD) {
            console.error("Email or Password environment variables are not set.");
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Email server configuration error." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({ message: "User already exists!" });
        }

        if (password !== confirmPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Passwords do not match." });
        }

        const verificationCode = generateVerificationCode();

        const user = new User({
            name,
            email,
            password: password,
            birthdate,
            isVerified: false,
            verificationCode,
            keepMeLogged: false,
            createdAt: new Date(),
            lastModified: new Date(),
            lastLogIn: new Date(),
            passwordChangedAt: null
        });

        await user.save();
        await sendVerificationEmail(email, name, verificationCode);

        res.status(StatusCodes.CREATED).json({
            message: 'Sign-up successful, please check your email for the verification code.'
        });
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "The server encountered an error and could not complete your request."
        });
    }
};

// POST - verify code (verify the user's account)
const verifyCode = async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
        }

        if (user.verificationCode === verificationCode) {
            user.isVerified = true;
            user.verificationCode = null;
            await user.save();

            res.status(StatusCodes.OK).json({ message: "Your account has been verified successfully." });
        } else {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid verification code." });
        }
    } catch (error) {
        console.error("Error verifying code: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred during verification." });
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

const sendEmailEmailChange = async (userEmail, userName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: "Your MovieRadar Email Address Has Been Changed",
            text: `Hello ${userName},
            \n\nWe wanted to let you know that your email address associated with MovieRadar has been successfully updated. If you made this change, no further action is required.
            \nIf you did not request this change, please contact us immediately for assistance.
            \nYour security is important to us, and we are here to help if you have any questions or concerns.
            \n\nBest regards,
            \nThe MovieRadar Team 🎥🍿`
        };
        await transporter.sendMail(mailOptions);
        console.log("Email change notification sent successfully.");
    } catch (error) {
        console.error('Error sending email change notification:', error);
    }
};

const requestEmailUpdate = async (req, res) => {
    const { password, newEmail } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Incorrect password." });
        }

        const existingUser = await User.findOne({ email: newEmail });
        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({ message: "Email is already in use." });
        }

        const verificationCode = generateVerificationCode();
        user.emailChangeCode = verificationCode;
        user.emailChangeCodeExpires = Date.now() + 10 * 60 * 1000;
        user.newEmail = newEmail;

        await user.save();
        await sendVerificationEmail(newEmail, user.name, verificationCode);

        res.status(StatusCodes.OK).json({
            message: "Verification code sent to the new email address. Please enter the code to confirm the change."
        });
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "The server encountered an error and could not complete your request."
        });
    }
};

const verifyEmailUpdateCode = async (req, res) => {
    const { verificationCode } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
        }

        if (verificationCode !== user.emailChangeCode) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid verification code." });
        }

        if (user.emailChangeCodeExpires < Date.now()) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Verification code has expired." });
        }

        user.email = user.newEmail;
        user.newEmail = undefined;
        user.emailChangeCode = undefined;
        user.emailChangeCodeExpires = undefined;
        user.lastModified = Date.now();

        await user.save();
        sendEmailEmailChange(user.email, user.name);
        res.status(StatusCodes.OK).json({ message: "Email updated successfully." });
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "The server encountered an error and could not complete your request."
        });
    }
};

const sendEmailPasswordChange = async (userEmail, userName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: "Your MovieRadar Credentials Have Been Changed",
            text: `Hello ${userName},
            \n\nWe wanted to let you know that your credentials have been successfully updated. If you made these changes, no further action is required.
            \nIf you did not request these changes, please contact us immediately for assistance.
            \nYour security is important to us, and we are here to help if you have any questions or concerns.
            \n\nBest regards,
            \nThe MovieRadar Team 🎥🍿`
        };
        await transporter.sendMail(mailOptions);
        console.log("Password changed email sent successfully.");
    } catch (error) {
        console.error('Error sending password changed email:', error);
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
            await sendEmailPasswordChange(req.user.email, req.user.name);
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
export {getAllUsers, getUserById, signup, verifyCode, updateUser, requestEmailUpdate, verifyEmailUpdateCode, updateUserPassword, deleteUser};