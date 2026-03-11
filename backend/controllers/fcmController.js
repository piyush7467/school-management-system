import { Student } from "../models/studentModel.js";
import { Teacher } from "../models/teacherModel.js";
import { Admin } from "../models/adminModel.js";

export const saveFcmToken = async (req, res) => {
  const { fcmToken } = req.body;
  const { _id, role } = req.user; // assuming isAuth attaches user info to req.user

  if (!fcmToken) {
    return res.status(400).json({ 
        success: false, 
        message: "FCM token is required" 
    });
  }

  try {
    let Model;

    // Choose the correct model based on user role
    if (role === "student") Model = Student;
    else if (role === "teacher") Model = Teacher;
    else if (role === "admin") Model = Admin;
    else return res.status(400).json({ success: false, message: "Invalid role" });

    const user = await Model.findByIdAndUpdate(_id, { fcmToken }, { new: true });
    res.status(200).json({ success: true, message: "FCM token saved", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
