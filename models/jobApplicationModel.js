import mongoose from "mongoose";
import { stringify } from "uuid";

const JobApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      ref: "JobPost",
      required: true,
    },

    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    resumeUrl: { type: String }, // Cloudinary or any file URL
    coverLetter: { type: String },
    portfolioUrl: { type: String },
    additionalInfo: { type: String },
    status: {
      type: String,
      enum: ["Applied", "Reviewed", "Interviewed", "Offered", "Rejected"],
      default: "Applied",
    },
    notes: { type: String },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("JobApplication", JobApplicationSchema);
