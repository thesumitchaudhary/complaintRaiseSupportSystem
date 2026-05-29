import express from "express";
import complaints from "../model/complaints.js";
import authMiddleware from "../middleware/authMiddleware.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendMail, sendAdminMail, sendStatusUpdateMail, sendForgotPasswordMail } from "../helper/sendMail.js"
import userModel from "../model/userModel.js";
import { authorizedRoles } from "../middleware/authorizedRoles.js";

const router = express.Router();

router.post("/raiseTickets", authMiddleware, async (req, res) => {
    try {
        const customerId = req.user.id;
        const { name, email, subject, message, serviceType } = req.body || {};

        if (!name || !email || !subject || !message || !serviceType) {
            return res.status(400).json({ success: false, message: "name, email, subject, message, and serviceType are mandatory" });
        }

        const user = await userModel.findOne({ _id: customerId });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const createdTicket = await complaints.create({ customerId: customerId, name, email, subject, message, serviceType, raisedDate: Date.now() });

        await sendMail(email, name, subject, message);
        await sendAdminMail(email, name, subject, message);

        return res.status(200).json({ success: true, message: "Ticket raised successfully", result: createdTicket });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to create ticket", error: error.message });
    }
});

const handleForgotPassword = async (req, res) => {
    try {
        const email = req.body?.email || req.query?.email;

        if (!email) {
            return res.status(400).json({ success: false, message: "email is mandatory" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "user is not found" });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

        user.resetPasswordToken = token;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        await sendForgotPasswordMail({
            email: user.email,
            name: user.name,
            resetUrl,
        });

        return res.status(200).json({
            success: true,
            message: "password reset link sent successfully",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

router.route("/forgotPassword").get(handleForgotPassword).post(handleForgotPassword);

router.get("/me", authMiddleware, authorizedRoles("user", "admin", "employee"), async (req, res) => {
    try {
        const id = req.user.id;

        const user = await userModel.findOne({ _id: id });

        if (!user) {
            return res.status(401).json({ success: false, message: "hey user is not found" });
        }

        return res.status(200).json({ success: true, message: "user fetched successfully", result: user });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
})

router.post("/resetPassword", async (req, res) => {
    try {
        const { email, token, newPassword } = req.body || {};

        if (!email || !token || !newPassword) {
            return res.status(400).json({ success: false, message: "email, token and newPassword are required" });
        }

        // First try to find user by token (robust if email encoding/case differs)
        let user = await userModel.findOne({ resetPasswordToken: token });

        // If not found by token, try by both email and token (original behaviour)
        if (!user) {
            user = await userModel.findOne({ email, resetPasswordToken: token });
        }

        if (!user) {
            console.debug("ResetPassword: no user found for token", { token, email });
            return res.status(400).json({ success: false, message: "Invalid token or email" });
        }

        if (!user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
            console.debug("ResetPassword: token expired", { token, email, expires: user.resetPasswordExpires });
            return res.status(400).json({ success: false, message: "Token has expired" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);

        user.password = hashed;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
});

router.get("/tickets", async (req, res) => {
    try {
        const tickets = await complaints.find().populate('customerId').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, result: tickets });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch tickets" });
    }
});

router.put("/tickets/:id", authMiddleware, async (req, res) => {

    try {

        const { status } = req.body;
        const ticketId = req.params.id;

        const normalizeStatus = (incomingStatus = "") => {
            const value = String(incomingStatus).trim().toLowerCase();

            if (value === "pending") return "pending";
            if (value === "accepted") return "accepted";
            if (value === "inprogress" || value === "in-progress" || value === "in progress" || value === "in_progress") return "in_progress";
            if (value === "resolved" || value === "completed") return "completed";
            if (value === "assigned") return "assigned";
            if (value === "rejected") return "rejected";

            return "";
        };

        const normalizedStatus = normalizeStatus(status);
        const shouldSetAcceptedDate = normalizedStatus === "accepted" || normalizedStatus === "in_progress";

        if (!normalizedStatus) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value"
            });
        }

        const updatedTicket = await complaints
            .findByIdAndUpdate(
                ticketId,
                {
                    status: normalizedStatus,
                    ...(shouldSetAcceptedDate ? { acceptedDate: Date.now() } : {}),
                },
                { returnDocument: 'after', runValidators: true }
            )
            .populate("customerId", "name email");

        if (!updatedTicket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        const customerName = updatedTicket.customerId?.name || updatedTicket.name;
        const customerEmail = updatedTicket.customerId?.email || updatedTicket.email;

        if (customerName && customerEmail) {
            await sendStatusUpdateMail(
                customerName,
                customerEmail,
                updatedTicket.subject,
                updatedTicket.message,
                updatedTicket.status
            );
        }

        return res.status(200).json({
            success: true,
            message: "Ticket updated successfully",
            result: updatedTicket
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            result: error.message
        });
    }
});

router.delete("/tickets/:id", authMiddleware, async (req, res) => {
    try {
        const ticketId = req.params.id;

        const deletedTicket = await complaints.findByIdAndDelete(ticketId);

        if (!deletedTicket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Ticket deleted successfully",
            result: deletedTicket
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            result: error.message
        });
    }
})

router.get("/logout", (req, res) => {
    try {
        res.clearCookie("token");

        res.status(200).json({
            success: true,
            message: "Logout is successful"
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

export default router