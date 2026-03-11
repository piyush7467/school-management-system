import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: "userRole", required: true }, 
  userRole: { type: String, enum: ["Student", "Teacher"], required: true }, 
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Resolved", "Rejected"], default: "Pending" },
  adminReply: { type: String }, 
}, { timestamps: true });

export const Complaint = mongoose.model("Complaint", complaintSchema);
