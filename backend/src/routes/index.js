import express from "express";
import complaints from "../model/complaints.js";
import authMiddleware from "../middleware/authMiddleware.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendMail, sendAdminMail, sendStatusUpdateMail, sendForgotPasswordMail } from "../helper/sendMail.js"
import userModel from "../model/userModel.js";

const router = express.Router();

router.post("/raiseTickets", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, subject, message } = req.body || {};

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: "name, email, subject, and message are mandatory" });
        }

        const user = await userModel.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const createdTicket = await complaints.create({ userId: userId, name, email, subject, message });

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

router.get("/tickets", authMiddleware, async (req, res) => {
    try {
        const tickets = await complaints.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, result: tickets });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch tickets" });
    }
});

router.put("/tickets/:id", authMiddleware, async (req, res) => {

    try {

        const { status } = req.body;
        const ticketId = req.params.id;

        const updatedTicket = await complaints
            .findByIdAndUpdate(
                ticketId,
                { status },
                { returnDocument: 'after', runValidators: true }
            )
            .populate("userId");

        if (!updatedTicket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        await sendStatusUpdateMail(
            updatedTicket.userId.name,
            updatedTicket.userId.email,
            updatedTicket.subject,
            updatedTicket.message,
            updatedTicket.status
        );

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