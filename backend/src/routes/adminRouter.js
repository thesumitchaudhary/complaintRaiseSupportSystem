import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../model/userModel.js";
import complaints from "../model/complaints.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizedRoles } from "../middleware/authorizedRoles.js"
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
            path: '/',
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
        const user = await userModel.find({ role: "user" }).populate("complaints");

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

// this is for the assign task to employee
router.post("/assignTask", authMiddleware, authorizedRoles("admin"), async (req, res) => {
    try {
        const {
            complaintId,
            employeeId,
            taskTitle,
            priority,
            dueDate,
            taskNotes,
        } = req.body;

        // find complaint
        const complaint = await complaints.findById(complaintId);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        // update complaint
        complaint.assignedEmployee = employeeId;

        complaint.assignedBy = req.user.id;

        complaint.priority = priority;

        complaint.deadline = dueDate;

        complaint.status = "assigned";

        complaint.assignedDate = Date.now()

        // task object
        complaint.task = {
            title: taskTitle,
            notes: taskNotes,
        };

        // assignment history
        complaint.assignmentHistory.push({
            employee: employeeId,

            assignedBy: req.user.id, // admin id from auth middleware

            deadline: dueDate,

            note: taskNotes,

            status: "assigned",
        });

        await complaint.save();

        res.status(200).json({
            success: true,
            message: "Task assigned successfully",
            complaint,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

export default router