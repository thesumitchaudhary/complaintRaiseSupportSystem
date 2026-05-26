  import mongoose from "mongoose";

  const userSchema = new mongoose.Schema(
    {
      name: String,

      email: {
        type: String,
        unique: true,
      },

      password: String,

      phone: String,

      address: String,

      role: {
        type: String,
        enum: ["user", "employee", "admin"],
        default: "user",
      },

      verificationCode: String,
      verified_at: Date,

      resetPasswordToken: String,
      resetPasswordExpires: Date,

      // only for employee
      service: [String],
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );

  userSchema.virtual("complaints", {
    ref: "complaint",
    localField: "_id",
    foreignField: "customerId",
  });

  export default mongoose.model("user", userSchema);