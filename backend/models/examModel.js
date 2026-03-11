// models/Exam.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const ExamSubjectSchema = new Schema({
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  maxMarks: { type: Number },
  passingMarks: { type: Number },
  date: { type: Date, required: true },        // Subject exam date
  startTime: { type: String, required: true }, // HH:mm format
  endTime: { type: String, required: true },
  roomId: { type: Schema.Types.ObjectId, ref: "Room" },       // optional
  teacherId: { type: Schema.Types.ObjectId, ref: "Teacher" }  // optional
}, { _id: true }); // Each subject exam gets its own _id


const ExamAssignmentSchema = new Schema({
  classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },
  classTeacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: false }
}, { _id: false });

const examSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  examType: { type: String, enum: ["Unit Test","Periodic Test","Midterm","Final","Other"], default: "Other" },
  startDate: { type: Date },
  endDate: { type: Date },
  subjects: { type: [ExamSubjectSchema], default: [] },
  assignments: { type: [ExamAssignmentSchema], default: [] },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

examSchema.index({ "assignments.classId": 1, "assignments.sectionId": 1 });
examSchema.index({ startDate: 1 });

export const Exam = mongoose.model("Exam", examSchema);
