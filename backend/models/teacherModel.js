import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  // Login credentials
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Basic info
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  profilePic: { type: String },

  // Subjects teacher can teach
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],

  // Multiple class-section assignments
  classSections: [
    {
      class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
      section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    },
  ],

  classTeacherOf: [
    {
      class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
      section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    },
  ],

  // Employment details
  // employeeId: { type: String, unique: true },
  employeeId: { type: String, unique: true, sparse: true },

  joiningDate: { type: Date, default: Date.now },
  qualification: { type: String },
  experience: { type: Number },

  // Personal info
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  dob: { type: Date },
  emergencyContact: { type: String },
  aadharNo: { type: String },

  // System fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  isEmailVerified: { type: Boolean, default: false },
  status: { type: String, enum: ["active", "inactive"], default: "active" },

  // 🔔 FCM Token field
  fcmToken: { type: String, default: null },

}, { timestamps: true });

export const Teacher = mongoose.model("Teacher", teacherSchema);
