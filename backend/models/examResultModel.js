// models/ExamResult.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const SubjectMarkSchema = new Schema({
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  marksObtained: { type: Number, required: true },
  maxMarks: { type: Number } // optional duplicate for reference
}, { _id: false });

const examResultSchema = new Schema({
  examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },
  marks: { type: [SubjectMarkSchema], default: [] },
  totalObtained: { type: Number },
  totalMax: { type: Number },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User" } // admin or classTeacher
}, { timestamps: true });

// one result per (exam, student)
examResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export const ExamResult = mongoose.model("ExamResult", examResultSchema);
