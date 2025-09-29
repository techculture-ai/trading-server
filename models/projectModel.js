import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
    unique: true,
  },
  image:{
    type: String,
    required: true,
  },
  slug:{
    type: String,
    required: true,
    unique: true,
  },
  createdAt:{
    type: Date,
    default: Date.now,
  },
  updatedAt:{
    type: Date,
    default: Date.now,
  },
});


const Category = mongoose.model("Category", categorySchema);

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  portfolioImages: [
    {
      type: String,
    },
  ],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  location: {
    type: String,
  },
  technologies: [
    {
      type: String,
    },
  ],
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["ongoing", "completed"],
    default: "ongoing",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

projectSchema.index({ category: 1 });
projectSchema.index({ updatedAt: -1 });

const Project = mongoose.model("Project", projectSchema);
export { Project, Category };
