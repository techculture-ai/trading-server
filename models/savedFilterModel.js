import mongoose from "mongoose";

const SavedFilterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  filterConditions: {
    type: Array,
    required: true,
    default: [],
  },
  createdBy: {
    type: String,
    default: "System",
  },
  isPublic: {
    type: Boolean,
    default: true, // All filters are visible to everyone
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
SavedFilterSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
SavedFilterSchema.index({ name: 1 });
SavedFilterSchema.index({ createdAt: -1 });
SavedFilterSchema.index({ usageCount: -1 });

export default mongoose.model("SavedFilter", SavedFilterSchema);
