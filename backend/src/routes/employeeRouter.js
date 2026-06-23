import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import userModel from "../model/userModel.js";
import {
    addWorkUpdate,
    getAssignedComplaints,
} from "../controllers/employeeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizedRoles } from "../middleware/authorizedRoles.js";

dotenv.config();

const router = express.Router();

router.get("/", (req, res) => {
    res.send("hey it's working right now");
})

router.post("/create", async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(401).json({ success: false, message: "hey name, email,password and confirmPassword is mandatory" });
        }

        if (password != confirmPassword) {
            return res.status(401).json({ message: false, message: "passowrd is not match" })
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const employee = await userModel.create({
            name,
            email,
            role: "employee",
            password: hash
        })

        const token = jwt.sign(
            { id: employee._id, name: employee.name, email: employee.email, role: employee.role },
            process.env.JWT_SECRET
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
        });

        res.status(200).json({ success: true, message: "hey employee create successfully", result: employee });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server Error", error: error.message });
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).json({ success: false, message: "hey email and password is mandatory" });
        }

        const employee = await userModel.findOne({ email });

        if (!employee) {
            return res.status(401).json({ success: false, message: "employee is not exist" });
        }

        const isMatch = await bcrypt.compare(password, employee.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        const token = jwt.sign(
            { id: employee._id, name: employee.name, email: employee.email, role: employee.role },
            process.env.JWT_SECRET
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            employee: { id: employee._id, name: employee.name, email: employee.email, role: employee.role },
        });

    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal servver Error", error: error.message });
    }
})

router.get("/logout", (req, res) => {
    try {
        res.clearCookie("token", { path: '/' });

        res.status(200).json({ success: true, message: "logout is successfully" })
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal servver Error", error: error.message });
    }
});

router.get("/showAssignedComplaint", authMiddleware, authorizedRoles("employee"), getAssignedComplaints);
router.get("/complaints", authMiddleware, authorizedRoles("employee"), getAssignedComplaints);
router.post("/complaints/:complaintId/work-updates", authMiddleware, authorizedRoles("employee"), addWorkUpdate);

export default router;
