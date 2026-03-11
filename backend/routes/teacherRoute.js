import express from "express";
import { getMyClasses, getMyStudents, getTeacherAssignedClassSections, getTeacherClassDetails, getTeacherProfile, teacherLogin, updateTeacher } from "../controllers/teacherController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { singleUpload } from "../middleware/multer.js";
import attendanceRoutes from "./attendanceRoute.js";
import { getAnnouncements } from "../controllers/adminAuthController.js";
import { createComplaint, getMyComplaints } from "../controllers/complaintController.js";
import { getAllRoutes } from "../controllers/busRouteController.js";
import { getAllBuses } from "../controllers/busController.js";
import { getTeacherAttendance } from "../controllers/teacherAttendanceController.js";
// import { markAttendanceByTeacher } from "../controllers/attendanceController.js";
// import { markAttendanceByTeacher } from "../controllers/attendanceController.js";

const router = express.Router();

// Teacher login
router.post("/login", teacherLogin);

router.get('/profile',authMiddleware(["teacher"]),getTeacherProfile)

// Teacher updates own profile
router.put("/profile/update", authMiddleware(["teacher"]), singleUpload, updateTeacher);

router.get("/classes", authMiddleware(["teacher"]), getMyClasses);

router.get("/my-students", authMiddleware(["teacher"]), getMyStudents);

router.get("/assigned-class-sections", authMiddleware(["teacher"]), getTeacherAssignedClassSections);

router.get('/my/class-details',authMiddleware(['teacher']),getTeacherClassDetails);

// router.post("/attendance/class/:classId/section/:sectionId/mark",authMiddleware(["teacher"]),markAttendanceByTeacher);

// Teacher attendance routes
router.use("/attendance", attendanceRoutes);

router.get("/me/my-attendance", authMiddleware(["teacher"]), getTeacherAttendance);

// router.post("/class/:classId/section/:sectionId/attendance/mark",authMiddleware(["teacher"]),markAttendanceByTeacher);

// Fetch announcements
router.get("/announcement/all", authMiddleware(["teacher"]), getAnnouncements);

// Complaint system (teacher)
router.post("/complaint", authMiddleware(["teacher"]), createComplaint);
router.get("/complaint/my", authMiddleware(["teacher"]), getMyComplaints);

// Teachers can only view
router.get("/transport/routes", authMiddleware(["teacher"]), getAllRoutes);
router.get("/transport/buses", authMiddleware(["teacher"]), getAllBuses);

export default router;











// import express from "express";
// import { teacherLogin, updateTeacher } from "../controllers/teacherController.js";
// import { authMiddleware } from "../middleware/authMiddleware.js";
// import { singleUpload } from "../middleware/multer.js";
// import attendanceRoutes from "./attendanceRoute.js";
// import { getAnnouncements } from "../controllers/adminAuthController.js";
// import { createComplaint, getMyComplaints } from "../controllers/complaintController.js";


// const router = express.Router();

// // Teacher auth
// router.post("/login", teacherLogin);

// // Teacher updates own profile
// router.put("/profile/update", authMiddleware(["teacher"]), singleUpload, updateTeacher);

// // Mount attendance routes for teacher
// router.use("/attendance", attendanceRoutes);

// // Teacher fetch announcements
// router.get("/getannouncements", authMiddleware([ "teacher"]), getAnnouncements);


// // Submit complaint (teacher)
// router.post("/submitcomplaint", authMiddleware(["teacher"]), createComplaint);

// // Get complaints (teacher)
// router.get("/getmycomplaint", authMiddleware(["teacher"]), getMyComplaints);


// export default router;
