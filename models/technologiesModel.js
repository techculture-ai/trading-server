import mongoose from "mongoose";

const technologySchema = new mongoose.Schema(
  {
    categoryKey: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    items: [{
      name:{
        type: String,
        required: true,
      }
    }],
  },
  {
    timestamps: true,
  }
);

const Technology = mongoose.model("Technology", technologySchema);

export default Technology;
