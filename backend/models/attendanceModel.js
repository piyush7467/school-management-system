import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["Present", "Absent", "Late"], required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }, // optional
    locked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Attendance= mongoose.model("Attendance", attendanceSchema);
