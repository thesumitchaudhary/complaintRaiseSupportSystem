import express from "express";
import userModel from "../model/userModel.js";
import ticketModel from "../model/ticketModel.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware.js";

dotenv.config()
const router = express.Router();

router.post("/create", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(401).json({ success: false, message: "name,email,password is missing" });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "user is already registered" })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await userModel.create({
            name,
            email,
            password: hashedPassword,
        });


        const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET);
        res.cookie("token", token, { httpOnly: true });


        res.status(201).json({ success: true, message: "user created successfully", result: { id: user._id, name: user.name, email: user.email } })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server Error", result: error.message });
    }
})


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "email and password are mandatory" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "user not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "password does not match" });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET not configured');
            return res.status(500).json({ success: false, message: 'Server configuration error' });
        }

        const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, jwtSecret);
        const cookieOptions = { httpOnly: true, sameSite: 'lax' };
        res.cookie("token", token, cookieOptions);

        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;

        return res.status(200).json({ success: true, message: "login successful", result: userObj });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Internal server Error", error: error.message });
    }
})

router.get("/ticketDetails", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const tickets = await ticketModel.find({ userId }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, message: "tickets show successfully", result: tickets });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server Error", error: error.message });
    }
})

router.get("/logout", async (req, res) => {
    try {
        res.clearCookie("token");

        res.status(200).json({ success: true, message: "user logout successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server is error" })
    }
})

export default router