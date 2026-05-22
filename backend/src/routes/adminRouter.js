import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../model/userModel.js";
// import complaints from "../model/complaints.js";

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and Password are required" });
        }

        const admin = await userModel.findOne({ email: email });
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

        const token = jwt.sign({ id: admin._id, email: admin.email, role: admin.role || 'admin' }, jwtSecret, { expiresIn: '1d' });

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

// this is routes for show user i   n admin dashboard

router.get("/showUser", async (req, res) => {
    try {
        const user = await userModel.find({role: "user"}).populate("complaints");

        if (!user) {
            res.status(401).json({ success: false, message: "hey user is not found" });
        }

        res.status(200).json({ success: false, result: user })
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
})

router.get("/showEmployee", async (req, res) => {
    try {
        const employee = await userModel.find({ role: "employee" })
        if (!employee) {
            res.status(401).json({ success: false, message: "hey employee is not found" });
        }

        res.status(200).json({ success: false, result: employee });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
})

export default router