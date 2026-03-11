import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "A", "B"
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },

  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },

  capacity: { type: Number, default: 50 }, // default 50 students

  // ✅ Each section has multiple subjects, each taught by one or more teachers
  subjects: [{
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }]
  }],

  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
}, { timestamps: true });

// prevent duplicate sections inside same class
sectionSchema.index({ classId: 1, name: 1 }, { unique: true });

export const Section = mongoose.model("Section", sectionSchema);

