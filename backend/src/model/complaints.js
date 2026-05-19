import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    // customer who raised complaint
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    serviceType: {
      type: String,
      enum: [
        "ac_repair",
        "pc_repair",
        "office_work",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "rejected",
      ],
      default: "pending",
    },

    // employee assigned to task
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // admin who assigned complaint
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    resolutionNote: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Complaint",
  complaintSchema
);