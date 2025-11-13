import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
  // Fixed fields based on your columns
  tradingCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  owner: String,
  name: String,
  mobileNo: String,
  emailId: {
    type: String,
    index: true,
  },
  dpClientId: String,
  branchCode: String,
  rmtlCode: String,
  investorType: String,
  accountOpenDate: String,
  accountStatus: String,
  firstTradeDate: String,
  holdingValue: String,
  ledgerBalance: String,
  lastTradeDate: String,
  ytdBrok: String,
  poaDdpi: String,
  nominee: String,
  annualIncome: String,
  occupation: String,
  activeExchange: String,
  city: {
    type: String,
    index: true,
  },
  state: String,
  lastLoginDate: String,
  callingStatus: String,
  nextFollowUpDate: String,
  remarks: String,
  
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