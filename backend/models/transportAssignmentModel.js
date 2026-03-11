import mongoose from "mongoose";

const transportAssignmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: "Bus", required: true },
  stop: { type: String, required: true },
  pickupTime: { type: String, required: true },
  dropTime: { type: String }  // <-- ADD THIS
}, { timestamps: true });

export const TransportAssignment = mongoose.model("TransportAssignment", transportAssignmentSchema);
