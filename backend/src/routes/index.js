import express from "express";
import ticketModel from "../model/ticketModel.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendMail, sendAdminMail } from "../helper/sendMail.js"
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

        const createdTicket = await ticketModel.create({ userId: userId, name, email, subject, message });

        await sendMail(email, name, subject, message);
        await sendAdminMail(email,name,subject, message);

        return res.status(200).json({ success: true, message: "Ticket raised successfully", result: createdTicket });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to create ticket", error: error.message });
    }
});

router.get("/tickets", authMiddleware, async (req, res) => {
    try {
        const tickets = await ticketModel.find().sort({createdAt: -1});
        return res.status(200).json({ success: true, result: tickets });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch tickets" });
    }
});

router.put("/tickets/:id", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const ticketId = req.params.id;

        const updatedTicket = await ticketModel.findByIdAndUpdate(
            ticketId,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedTicket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        

        return res.status(200).json({
            success: true,
            message: "Ticket updated successfully",
            result: updatedTicket
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", result: error.message });
    }
})

router.delete("/tickets/:id", authMiddleware, async (req, res) => {
    try {
        const ticketId = req.params.id;

        const deletedTicket = await ticketModel.findByIdAndDelete(ticketId);

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