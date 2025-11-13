import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
  // Fixed fields - only tradingCode is required
  tradingCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  owner: { type: String, default: "" },
  name: { type: String, default: "" },
  mobileNo: { type: String, default: "" },
  emailId: {
    type: String,
    index: true,
    default: "",
  },
  dpClientId: { type: String, default: "" },
  branchCode: { type: String, default: "" },
  rmtlCode: { type: String, default: "" },
  investorType: { type: String, default: "" },
  accountOpenDate: { type: String, default: "" },
  accountStatus: { type: String, default: "" },
  firstTradeDate: { type: String, default: "" },
  holdingValue: { type: String, default: "" },
  ledgerBalance: { type: String, default: "" },
  lastTradeDate: { type: String, default: "" },
  ytdBrok: { type: String, default: "" },
  activeExchange: { type: String, default: "" },
  poaDdpi: { type: String, default: "" },
  nominee: { type: String, default: "" },
  annualIncome: { type: String, default: "" },
  occupation: { type: String, default: "" },
  city: {
    type: String,
    index: true,
    default: "",
  },
  state: { type: String, default: "" },
  lastLoginDate: { type: String, default: "" },
  callingStatus: { type: String, default: "" },
  nextFollowUpDate: { type: String, default: "" },
  remarks: { type: String, default: "" },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false,
  },
  
  // Metadata
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for search
ClientSchema.index({ tradingCode: 1 });
ClientSchema.index({ name: 1 });
ClientSchema.index({ emailId: 1 });
ClientSchema.index({ mobileNo: 1 });
ClientSchema.index({ city: 1 });
ClientSchema.index({ uploadedAt: -1 });
ClientSchema.index({ isRead: 1 });

export default mongoose.model("Client", ClientSchema);