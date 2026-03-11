import mongoose from "mongoose";

const parentSchema = new mongoose.Schema({
  father: { name: String, email: String, phone: String, occupation: String },
  mother: { name: String, email: String, phone: String, occupation: String },
});

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String },
  password: { type: String, required: true },

  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },

  rollNumber: { type: String },
  gender: { type: String, enum: ["male", "female", "other"] },
  address: { type: String },
  dateOfBirth: { type: Date },
  profilePic: { type: String, default: "" },
  parentInfo: parentSchema,
  phone: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  isEmailVerified: { type: Boolean, default: false },

  // 🔔 FCM Token field
  fcmToken: { type: String, default: null },

}, { timestamps: true });

export const Student = mongoose.model("Student", studentSchema);

