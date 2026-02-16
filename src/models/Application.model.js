import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    passport: String,
    nationality: String,

    passportFile: String,
    aadhaarFile: String,
    panFile: String,
    photoFile: String,

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);
