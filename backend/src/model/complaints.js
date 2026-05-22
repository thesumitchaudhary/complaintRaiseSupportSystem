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

    raisedDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "rejected",
        "overdue",
      ],
      default: "pending",
    },

    // current assigned employee
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

    // task deadline
    deadline: {
      type: Date,
      default: null,
    },

    resolutionNote: {
      type: String,
      default: "",
    },

    // full assignment history
    assignmentHistory: [
      {
        employee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        assignedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        assignedAt: {
          type: Date,
          default: Date.now,
        },

        deadline: {
          type: Date,
          default: null,
        },

        completedAt: {
          type: Date,
          default: null,
        },

        status: {
          type: String,
          enum: [
            "assigned",
            "in_progress",
            "completed",
            "reassigned",
            "expired",
          ],
          default: "assigned",
        },

        note: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Complaint", complaintSchema);