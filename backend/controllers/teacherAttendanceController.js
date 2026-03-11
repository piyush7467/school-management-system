import mongoose from "mongoose";
import { TeacherAttendance } from "../models/teacherAttendanceModel.js";

// ✅ 1. Mark teacher attendance
export const markTeacherAttendance = async (req, res) => {
  try {
    const { teacherId, date, status } = req.body;

    // prevent duplicate marking for same teacher/date
    const existing = await TeacherAttendance.findOne({
      teacherId,
      date: { $gte: new Date(date).setHours(0, 0, 0, 0), $lt: new Date(date).setHours(23, 59, 59, 999) },
    });

    if (existing)
      return res.status(400).json({ message: "Attendance already marked for this date." });

    const attendance = await TeacherAttendance.create({
      teacherId,
      date,
      status,
      markedBy: req.user.id,
    });

    res.status(201).json({ success: true, attendance });
  } catch (error) {
    console.error("Error marking teacher attendance:", error);
    res.status(500).json({ message: "Server error while marking attendance." });
  }
};

// ✅ 2. Get all teacher attendance
export const getAllTeacherAttendance = async (req, res) => {
  try {
    const { date, fromDate, toDate } = req.query;
    let filter = {};

    if (date) {
      const d = new Date(date);
      filter.date = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lt: new Date(d.setHours(23, 59, 59, 999)),
      };
    } else if (fromDate && toDate) {
      filter.date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const records = await TeacherAttendance.find(filter)
      .populate("teacherId", "name email")
      .populate("markedBy", "name role")
      .sort({ date: -1 });

    res.status(200).json({ success: true, records });
  } catch (error) {
    console.error("Error fetching teacher attendance:", error);
    res.status(500).json({ message: "Server error while fetching attendance." });
  }
};


export const getTeacherAttendance = async (req, res) => {
  try {
    const teacherId = req.user.id; // taken from authMiddleware

    const records = await TeacherAttendance.find({ teacherId })
      .populate("markedBy", "name role") // optional: show who marked
      .sort({ date: -1 }); // latest first

    if (!records.length) {
      return res.status(404).json({ message: "No attendance records found" });
    }

    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching teacher attendance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
