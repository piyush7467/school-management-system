import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Math", "Science"
  code: { type: String }, // e.g., MTH101
  description: { type: String }
}, { timestamps: true });

export const Subject = mongoose.model("Subject", subjectSchema);

