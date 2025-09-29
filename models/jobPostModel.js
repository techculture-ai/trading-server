import mongoose from "mongoose";

const jobPostSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    department: { type: String },
    location: { type: String },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract", "Remote"],
      default: "Full-time",
    },
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
    },
    experienceRequired: { type: String }, // e.g. "2+ years", or can use Number
    skills: [String],
    isActive: { type: Boolean, default: true },
    deadline: { type: Date },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const JobPost = mongoose.model("JobPost", jobPostSchema);
export default JobPost;
