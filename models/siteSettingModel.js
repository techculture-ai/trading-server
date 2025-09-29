import mongoose from "mongoose";

const SiteSettingSchema = new mongoose.Schema(
  {
    siteTitle: { type: String, required: true },
    email: { type: String, required: true },
    contactNo: { type: String, required: true },
    logo: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    registeredAddress: { type: String },
    officeAddress: { type: String },
    registeredIframe: { type: String },
    officeIframe: { type: String },
    clients: [
      {
        type: String,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SiteSetting", SiteSettingSchema);