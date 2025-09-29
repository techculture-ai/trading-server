import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    projectName: {
      type: String,
      default: "General",
      trim: true,
    },
    demoDate: {
      type: Date,
      default: null,
    },
    demoTime: {
      type: String,
      default: null,
    },
    // Google Meet fields
    googleMeetLink: {
      type: String,
      default: null,
    },
    googleEventId: {
      type: String,
      default: null,
    },
    googleEventLink: {
      type: String,
      default: null,
    },
    // Location tracking
    ip: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: "Unknown",
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
    isEmailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Enquiry = mongoose.model("Enquiry", enquirySchema);
export default Enquiry;