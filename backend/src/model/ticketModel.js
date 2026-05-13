import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    name: String,
    email: String,
    subject: String,
    message: String,
    status: {
        type: String,
        enum: ["Pending", "In-Progress", "Resolved"],
        default: "Pending"
    }
}, { timestamps: true });

export default mongoose.model("Ticket", ticketSchema);