import express from "express";
import userModel from "../model/userModel.js";
import complaints from "../model/complaints.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendEmailVerificationCodeTemplate, sendWelcomeMailTemplate } from "../helper/sendMail.js";

dotenv.config()
const router = express.Router();

router.post("/create", async (req, res) => {
    try {
        const { name, email, password, confirmedPassword } = req.body;

        if (!name || !email || !password || !confirmedPassword) {
            return res.status(401).json({ success: false, message: "name, email, password and confirmedPassword are required" });
        }

        if (password != confirmedPassword) {
            return res.status(401).json({ success: false, message: "hey the password is not match" });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "user is already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const code = Math.floor(100000 + Math.random() * 99999);

        const user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            verificationCode: code,
        });

        const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET);
        res.cookie("token", token, { httpOnly: true });

        await sendEmailVerificationCodeTemplate({ name: user.name, email: user.email, verificationCode: user.verificationCode });

        res.status(201).json({ success: true, message: "user created successfully", result: { id: user._id, name: user.name, email: user.email } })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server Error", result: error.message });
    }
})

router.post("/verifyEmail", async (req, res) => {
    try {
        const { code } = req.body;

        if (code) {
            const user = await userModel.findOne({
                verificationCode: code
            })
            if (!user) {
                return res.status(400).json({ success: false, message: "Invalid or Expired Code" })
            }
            user.verified_at = Date.now();
            user.verificationCode = undefined;
            await user.save();
            await sendWelcomeMailTemplate(user.email, user.name);
            return res.status(200).json({ success: true, message: "Email verified successfully", result: { id: user._id, name: user.name, email: user.email } });
        } else if (email) {
            const user = await userModel.findOne({ email });

            if (!user) {
                return res.status(400).json({ success: false, message: "Email not found" });
            }
            return res.status(200).json({ success: true, message: "Email exists", user });
        }
        return res.status(400).json({ success: false, message: "Email or code required" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server Error", result: error.message })
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

        const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, jwtSecret);
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
        const customerId = req.user.id;

        const user = await userModel.findById(customerId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const tickets = await complaints.find({ customerId }).sort({ createdAt: -1 });

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