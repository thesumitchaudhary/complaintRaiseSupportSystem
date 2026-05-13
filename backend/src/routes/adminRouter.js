import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import adminModel from "../model/adminModel.js";

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and Password are required" });
        }

        const admin = await adminModel.findOne({ email: email });
        // const admin = await adminModel.findOne({ email: email.trim() });

        if (!admin) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ success: false, message: "JWT secret not configured" });
        }

        const token = jwt.sign({ id: admin._id, email: admin.email }, jwtSecret, { expiresIn: '1d' });

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({ success: true, message: "Login successful", token, admin: { email: admin.email } });
    } catch (error) {
        // Need to log the error
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" })
    }
})

export default router