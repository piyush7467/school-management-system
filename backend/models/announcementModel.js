import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  target: [{ type: String, enum: ["admin", "teacher", "student", "all"], required: true }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Announcement = mongoose.model("Announcement", announcementSchema);
