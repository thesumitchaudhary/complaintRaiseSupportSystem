import mongoose from "mongoose";

import complaint from "../model/complaints.js";
import userModel from "../model/userModel.js";

const normalizeWorkStatus = (status = "in_progress") => {
    const value = String(status).trim().toLowerCase();

    if (value === "assigned") return "assigned";
    if (["inprogress", "in-progress", "in progress", "in_progress"].includes(value)) return "in_progress";
    if (["completed", "complete", "resolved"].includes(value)) return "completed";
    if (["onhold", "on-hold", "on hold", "on_hold"].includes(value)) return "on_hold";

    return "";
};

export const getAssignedComplaints = async (req, res) => {
    try {
        const id = req.user.id;

        const employee = await userModel.findOne({ _id: id, role: "employee" });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee does not exist",
            });
        }

        const assignedComplaints = await complaint
            .find({
                assignedEmployee: id,
            })
            .populate("customerId", "name email")
            .populate("assignedBy", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: assignedComplaints.length,
            assignedComplaints,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const addWorkUpdate = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const { complaintId } = req.params;
        const { message, status = "in_progress", progress } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(complaintId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid complaint id",
            });
        }

        const normalizedStatus = normalizeWorkStatus(status);

        if (!normalizedStatus) {
            return res.status(400).json({
                success: false,
                message: "status must be assigned, in_progress, completed, or on_hold",
            });
        }

        const trimmedMessage = String(message || "").trim();

        if (!trimmedMessage) {
            return res.status(400).json({
                success: false,
                message: "message is required",
            });
        }

        let normalizedProgress;

        if (progress !== undefined) {
            normalizedProgress = Number(progress);

            if (!Number.isFinite(normalizedProgress) || normalizedProgress < 0 || normalizedProgress > 100) {
                return res.status(400).json({
                    success: false,
                    message: "progress must be a number between 0 and 100",
                });
            }
        }

        const employee = await userModel.findOne({ _id: employeeId, role: "employee" });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee does not exist",
            });
        }

        const assignedComplaint = await complaint.findOne({
            _id: complaintId,
            assignedEmployee: employeeId,
        });

        if (!assignedComplaint) {
            return res.status(404).json({
                success: false,
                message: "Assigned complaint not found",
            });
        }

        const now = new Date();
        const update = {
            updatedBy: employee._id,
            message: trimmedMessage,
            status: normalizedStatus,
            updatedAt: now,
        };

        if (normalizedProgress !== undefined) {
            update.progress = normalizedProgress;
        }

        assignedComplaint.workUpdates.push(update);

        if (normalizedStatus !== "on_hold") {
            assignedComplaint.status = normalizedStatus;
        }

        if (normalizedStatus === "in_progress" && !assignedComplaint.acceptedDate) {
            assignedComplaint.acceptedDate = now;
        }

        if (normalizedStatus === "completed") {
            assignedComplaint.completedDate = now;
            assignedComplaint.resolutionNote = trimmedMessage;
        }

        const latestAssignment = [...assignedComplaint.assignmentHistory]
            .reverse()
            .find((history) => String(history.employee) === String(employee._id));

        if (latestAssignment) {
            latestAssignment.status = normalizedStatus === "on_hold" ? "in_progress" : normalizedStatus;

            if (normalizedStatus === "completed") {
                latestAssignment.completedAt = now;
            }
        }

        await assignedComplaint.save();

        const updatedComplaint = await complaint
            .findById(assignedComplaint._id)
            .populate("customerId", "name email")
            .populate("assignedBy", "name email")
            .populate("assignedEmployee", "name email");

        return res.status(200).json({
            success: true,
            message: "Work update added successfully",
            result: updatedComplaint,
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
