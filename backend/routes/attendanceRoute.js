import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { editAttendance, getAttendanceByTeacher, getAttendanceReport, getStudentAttendance, markAttendance, markAttendanceByTeacher, updateAttendanceByTeacher, } from "../controllers/attendanceController.js";

const router = express.Router();


 
router.post("/class/:classId/section/:sectionId/mark", authMiddleware(["teacher", "admin"]), markAttendance);
router.get("/class/:classId/section/:sectionId/report", authMiddleware(["teacher", "admin"]), getAttendanceReport);

router.put("/class/:classId/section/:sectionId/student/:studentId/edit", authMiddleware(["teacher", "admin"]),editAttendance);

router.post("/class/:classId/section/:sectionId/mark",authMiddleware(["teacher", "admin"]),markAttendanceByTeacher);
router.get('/class/:classId/section/:sectionId/report',authMiddleware(["teacher", "admin"]),getAttendanceByTeacher);
router.put('/class/:classId/section/:sectionId/update',authMiddleware(["teacher", "admin"]),updateAttendanceByTeacher);

router.get('/class/me/my-attendance',authMiddleware(["student"]),getStudentAttendance);

export default router;
