import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import complaints from "../model/complaints.js";
import userModel from "../model/userModel.js";

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and Password are required" });
        }

        const admin = await userModel.findOne({ email: email });

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

        const token = jwt.sign({ id: admin._id, email: admin.email, role: admin.role || "admin" }, jwtSecret, { expiresIn: "1d" });

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/",
        });

        return res.status(200).json({ success: true, message: "Login successful", token, admin: { email: admin.email } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const showUsers = async (req, res) => {
    try {
        const user = await userModel.find({ role: "user" }).populate("complaints");

        if (!user) {
            return res.status(401).json({ success: false, message: "hey user is not found" });
        }

        return res.status(200).json({ success: false, result: user });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const showEmployees = async (req, res) => {
    try {
        const employees = await userModel
            .find({ role: "employee" })
            .select("-password");

        if (employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No employees found",
            });
        }

        const result = await Promise.all(
            employees.map(async (emp) => {
                const tasks = await complaints.find({
                    assignedEmployee: emp._id,
                });

                return {
                    employee: emp,
                    tasks,
                };
            })
        );

        return res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const assignTask = async (req, res) => {
    try {
        const {
            complaintId,
            employeeId,
            taskTitle,
            priority,
            dueDate,
            taskNotes,
        } = req.body;

        const complaint = await complaints.findById(complaintId);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        complaint.assignedEmployee = employeeId;
        complaint.assignedBy = req.user.id;
        complaint.priority = priority;
        complaint.deadline = dueDate;
        complaint.status = "assigned";
        complaint.assignedDate = Date.now();
        complaint.task = {
            title: taskTitle,
            notes: taskNotes,
        };

        complaint.assignmentHistory.push({
            employee: employeeId,
            assignedBy: req.user.id,
            deadline: dueDate,
            note: taskNotes,
            status: "assigned",
        });

        await complaint.save();

        return res.status(200).json({
            success: true,
            message: "Task assigned successfully",
            complaint,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const reassignTask = async (req, res) => {
    try {
        const {
            complaintId,
            newEmployeeId,
            dueDate,
            taskTitle,
            priority,
            taskNotes,
        } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(complaintId) ||
            !mongoose.Types.ObjectId.isValid(newEmployeeId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid complaintId and newEmployeeId are required",
            });
        }

        const complaint = await complaints.findById(complaintId);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        if (!complaint.assignedEmployee) {
            return res.status(400).json({
                success: false,
                message: "Complaint is not assigned yet",
            });
        }

        if (String(complaint.assignedEmployee) === String(newEmployeeId)) {
            return res.status(400).json({
                success: false,
                message: "Complaint is already assigned to this employee",
            });
        }

        const employee = await userModel.findOne({
            _id: newEmployeeId,
            role: "employee",
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        if (priority && !["low", "medium", "high"].includes(priority)) {
            return res.status(400).json({
                success: false,
                message: "Priority must be low, medium, or high",
            });
        }

        const lastAssignment =
            complaint.assignmentHistory[
                complaint.assignmentHistory.length - 1
            ];

        if (lastAssignment) {
            lastAssignment.status = "reassigned";
        }

        complaint.assignedEmployee = newEmployeeId;
        complaint.assignedBy = req.user.id;
        complaint.deadline = dueDate;
        complaint.assignedDate = new Date();
        complaint.status = "assigned";

        if (priority) {
            complaint.priority = priority;
        }

        if (taskTitle || taskNotes) {
            complaint.task = {
                title: taskTitle || complaint.task?.title || "",
                notes: taskNotes || complaint.task?.notes || "",
            };
        }

        complaint.assignmentHistory.push({
            employee: newEmployeeId,
            assignedBy: req.user.id,
            assignedAt: new Date(),
            deadline: dueDate,
            note: taskNotes,
            status: "assigned",
        });

        await complaint.save();

        return res.status(200).json({
            success: true,
            message: "Task reassigned successfully",
            complaint,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
