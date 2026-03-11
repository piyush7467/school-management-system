import express from "express";
import { adminUpdateStudent, createStudent, deleteStudent, getMyClassDetails, getMyClasses, getStudentById, getStudentProfile, getStudents, getStudentsByClass, getStudentsByClassSection, studentLogin, studentUpdateProfile } from "../controllers/studentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { singleUpload } from "../middleware/multer.js";
import { createComplaint, getMyComplaints } from "../controllers/complaintController.js";
import { getAnnouncements } from "../controllers/adminAuthController.js";
import { getAllRoutes } from "../controllers/busRouteController.js";
import { getAllBuses } from "../controllers/busController.js";
import { getMyTransport } from "../controllers/transportAssignmentController.js";
import attendanceRoutes from "./attendanceRoute.js";

const router = express.Router();

// Student login
router.post("/login", studentLogin);
router.get('/profile',authMiddleware(["student"]),getStudentProfile)
// Student updates own profile
router.put("/profile/update", authMiddleware(["student"]), singleUpload, studentUpdateProfile);


router.get("/classe", authMiddleware(["student"]), getMyClasses);

// Fetch announcements
router.get("/announcement/all", authMiddleware(["student"]), getAnnouncements);

// Complaint system (student)
router.post("/complaint/create", authMiddleware(["student"]), createComplaint);
router.get("/complaint/my", authMiddleware(["student"]), getMyComplaints);


// Additional student-specific routes can be added here
router.post("/createstudent", authMiddleware(["admin"]), singleUpload, createStudent);
router.get("/getstudent", authMiddleware(["admin"]), getStudents);
router.get('/viewstudent/class/:classId', authMiddleware(['admin']), getStudentsByClass);
// Get students by class & section for attendance
router.get("/viewstudent/class/:classId/section/:sectionId", authMiddleware(['admin']), getStudentsByClassSection);
router.get("/getstudent/:id", authMiddleware(["admin"]), getStudentById);
router.put("/updatestudent/:id", authMiddleware(["admin"]), singleUpload, adminUpdateStudent);
router.delete("/student/:id/delete", authMiddleware(["admin"]), deleteStudent);

router.get("/my-class-details", authMiddleware(["student"]), getMyClassDetails);
router.use("/attendance", attendanceRoutes);


// transport routes
router.get("/transport/routes", authMiddleware(["student"]), getAllRoutes);
router.get("/transport/buses", authMiddleware(["student"]), getAllBuses);
router.get("/transport/my", authMiddleware(["student"]), getMyTransport);

export default router;










// import express from "express";
// import { studentLogin, studentUpdateProfile,  } from "../controllers/studentController.js";
// import { authMiddleware } from "../middleware/authMiddleware.js";
// import { singleUpload } from "../middleware/multer.js";
// import { getAnnouncements } from "../controllers/adminAuthController.js";
// import { createComplaint, getMyComplaints } from "../controllers/complaintController.js";

// const router = express.Router();

// router.post('/login',studentLogin);

// router.put("/profile/update", authMiddleware(["student"]), singleUpload, studentUpdateProfile);
// // Student/Teacher fetch announcements
// router.get("/getannouncements", authMiddleware(["student"]), getAnnouncements);


// // Submit complaint (student)
// router.post("/submitcomplaint", authMiddleware(["student"]), createComplaint);

// // Get complaints (student)
// router.get("/getmycomplaint", authMiddleware(["student"]), getMyComplaints);

// export default router;
