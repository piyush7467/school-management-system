import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // login ID like "admin1"
    name: { type: String, required: true },
    password: { type: String, required: true },

    // Optional fields
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    profilePic: { type: String }, // URL or file path
    address: { type: String },
    isEmailVerified: { type: Boolean, default: false },

    // 🔔 FCM Token field
    fcmToken: { type: String, default: null },

    // Arrays of students and teachers (store ObjectIds)
    // students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    // teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],

}, { timestamps: true });

export const Admin = mongoose.model("Admin", adminSchema);
