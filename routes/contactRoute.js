import express from "express";
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing or invalid.' });
  }

  jwt.verify(token,  process.env.JWT_SECRET ,(err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is not valid.' });
    }
    req.user = user;
    next();
  });
};

router.post("/form", authenticateToken, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    let mailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "New Contact Form Message",
      text: `User Name: ${req.user.name}\nUser Email: ${req.user.email}\n\nMessage: ${message}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send the message." });
  }
});

export default router;