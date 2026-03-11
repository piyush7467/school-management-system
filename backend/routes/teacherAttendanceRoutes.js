import express from "express";
import { getAllTeacherAttendance, markTeacherAttendance } from "../controllers/teacherAttendanceController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin marks and views teacher attendance
router.post("/mark", authMiddleware(["admin"]), markTeacherAttendance);
router.get("/view", authMiddleware(["admin"]), getAllTeacherAttendance);

export default router;
