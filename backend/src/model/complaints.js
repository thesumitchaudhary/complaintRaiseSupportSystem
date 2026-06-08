  import mongoose from "mongoose";

  const complaintSchema = new mongoose.Schema(
    {
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
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

      acceptedDate: {
        type: Date,
        default: null,
      },

      rejectedDate: {
        type: Date,
        default: null,
      },

      assignedDate: {
        type: Date,
        default: null,
      },

      completedDate: {
        type: Date,
        default: null,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "accepted",
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
        ref: "user",
        default: null,
      },

      // admin who assigned complaint
      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null,
      },

      priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      
      // task information
      task: {
        title: {
          type: String,
          default: "",
        },

        notes: {
          type: String,
          default: "",
        },
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
            ref: "user",
          },

          assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
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

      // employee work updates
      workUpdates: [
        {
          updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
          },

          message: {
            type: String,
            required: true,
          },

          status: {
            type: String,
            enum: [
              "assigned",
              "in_progress",
              "completed",
              "on_hold",
            ],
            default: "in_progress",
          },

          progress: {
            type: Number,
            default: 0,
          },

          images: [String],

          updatedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    {
      timestamps: true,
    }
  );

  export default mongoose.model("complaint", complaintSchema);