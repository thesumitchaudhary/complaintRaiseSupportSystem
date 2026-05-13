import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket"
    }
})

export default mongoose.model("user", userSchema)