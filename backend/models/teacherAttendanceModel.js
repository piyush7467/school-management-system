import mongoose from "mongoose";

const teacherAttendanceSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Leave"],
      required: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    locked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const TeacherAttendance = mongoose.model("TeacherAttendance",teacherAttendanceSchema);
