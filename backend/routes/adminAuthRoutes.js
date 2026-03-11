import express from "express";
import { adminLogin, assignClassTeacher, createAnnouncement, getAdminProfile, getAnnouncements, getClassTeacherAssignments, unassignClassTeacher, updateProfile } from "../controllers/adminAuthController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { singleUpload } from "../middleware/multer.js";
// import studentRoutes from "./schoolMembersRoute.js";
import studentRoutes from "./studentRoute.js";
import teacherRoutes from "./schoolMembersRoute.js"
import classRoutes from "./classRoutes.js";
import transportRoutes from "./transportRoutes.js";
import attendanceRoutes from "./attendanceRoute.js";
import teacherAttendanceRoutes from "./teacherAttendanceRoutes.js";
import examRoutes from "./examRoutes.js";
import roomRoutes from "./roomRoutes.js";

import { getAllComplaints, updateComplaint } from "../controllers/complaintController.js";
import { Subject } from "../models/subjectModel.js";
import {  getStudentsByClassOnly } from "../controllers/studentController.js";


const router = express.Router();

router.post("/login", adminLogin);
router.get('/profile/view',authMiddleware(['admin']),getAdminProfile)
router.put('/profile/update', authMiddleware(['admin']), singleUpload, updateProfile);

// Admin creates announcement
router.post("/announcement/create", authMiddleware(["admin"]), createAnnouncement);
router.get('/announcement/all',authMiddleware(['admin']),getAnnouncements);

// Admin take action on complaints
router.get("/getallcomplaint", authMiddleware(['admin']),  getAllComplaints);
router.put("/updatecomplaint/:complaintId", authMiddleware(['admin']), updateComplaint);
router.get('/viewstudent/class/:classId', authMiddleware(['admin']), getStudentsByClassOnly);

router.get('/getallsubjects',authMiddleware(['admin']), async (req, res) => {
  try {
    const subjects = await Subject.find().lean(); // fetch all subjects
    res.status(200).json({ success: true, total: subjects.length, subjects });
  }
    catch (err) {
    res.status(500).json({ success: false, message: err.message });
    }
});


router.post("/assign-class-teacher",authMiddleware(["admin"]), assignClassTeacher);
router.get("/class-teacher-assignments",authMiddleware(["admin"]), getClassTeacherAssignments);
router.delete("/unassign-class-teacher/:assignmentId",authMiddleware(["admin"]), unassignClassTeacher);





// Mount student routes under /students
router.use("/students", studentRoutes);
// Mount teacher routes under /students
router.use("/teachers", teacherRoutes);
// Class management routes
router.use("/classes", classRoutes);
// Mount attendance routes
router.use("/attendance", attendanceRoutes);
// Mount Transport Management
router.use("/transport", transportRoutes);
// Mount routes for admin exam management
router.use('/exam',examRoutes);
// Mount routes for room
router.use('/room',roomRoutes);

// mount routes for admin take teacher attendance
router.use('/teacher-attendance',teacherAttendanceRoutes)
export default router;
