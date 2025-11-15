import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
    index: true,
  },
  tradingCode: {
    type: String,
    required: true,
    index: true,
  },
  action: {
    type: String,
    enum: ["UPDATE", "CREATE", "DELETE"],
    required: true,
  },
  editedBy: {
    type: String,
    default: "Admin",
    required: true,
  },
  editedByEmail: {
    type: String,
    default: "",
  },
  changes: [
    {
      field: {
        type: String,
        required: true,
      },
      fieldLabel: {
        type: String,
        required: true,
      },
      oldValue: {
        type: String,
        default: "",
      },
      newValue: {
        type: String,
        default: "",
      },
    },
  ],
  metadata: {
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Create compound index for efficient queries
AuditLogSchema.index({ clientId: 1, createdAt: -1 });
AuditLogSchema.index({ tradingCode: 1, createdAt: -1 });
AuditLogSchema.index({ editedBy: 1, createdAt: -1 });

export default mongoose.model("AuditLog", AuditLogSchema);
