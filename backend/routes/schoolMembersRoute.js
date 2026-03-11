import express from "express";
import { 
  adminUpdateStudent,  deleteStudent, 
  getStudentById,  getStudentsByClass 
} from "../controllers/studentController.js";
import { 
  adminUpdateTeacher, createTeacher, deleteTeacher, 
  getTeacherById, getTeachers, 
  
} from "../controllers/teacherController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

/* ---------------- STUDENTS ---------------- */
// router.post("/createstudent", authMiddleware(["admin"]), singleUpload, createStudent);
// router.get("/getstudent", authMiddleware(["admin"]), getStudents);
router.get("/student/:id", authMiddleware(["admin"]), getStudentById);
router.put("/updatestudent/:id", authMiddleware(["admin"]), singleUpload, adminUpdateStudent);
router.delete("/student/:id", authMiddleware(["admin"]), deleteStudent);

// Get students by class & section
router.get("/class/:classId/students", authMiddleware(["admin"]), getStudentsByClass);
router.get("/class/:classId/section/:sectionId/students", authMiddleware(["admin"]), getStudentsByClass);

/* ---------------- TEACHERS ---------------- */
router.post("/createteacher", authMiddleware(["admin"]), singleUpload, createTeacher);
router.get("/viewteacher", authMiddleware(["admin"]), getTeachers);
router.get("/teacher/:id", authMiddleware(["admin"]), getTeacherById);
router.put("/updateteacher/:id", authMiddleware(["admin"]), singleUpload, adminUpdateTeacher);
router.delete("/teacher/:id", authMiddleware(["admin"]), deleteTeacher);

// Subject-based teacher queries
// router.get("/teacher/subject/:subjectId", authMiddleware(["admin"]), getTeachersBySubject);
// router.get("/teacher/subject/:subjectId/details", authMiddleware(["admin"]), getTeachersBySubjectEmbedded);

export default router;













// import express from "express";
// import { adminUpdateStudent, createStudent, deleteStudent, getStudentById, getStudents, getStudentsByClass } from "../controllers/studentController.js";
// import { authMiddleware } from "../middleware/authMiddleware.js";
// import { adminUpdateTeacher, createTeacher, deleteTeacher, getTeacherById, getTeachers, getTeachersBySubject, getTeachersBySubjectEmbedded } from "../controllers/teacherController.js";
// import { singleUpload } from "../middleware/multer.js";


// const router = express.Router();

// // Admin can manage students
// router.post("/createstudent", authMiddleware(["admin"]),singleUpload, createStudent);
// router.get("/viewstudent", authMiddleware(["admin"]), getStudents);
// router.delete("/deletestudent/:id", authMiddleware(["admin"]), deleteStudent);

// router.get('/viewstudent/:id', authMiddleware(['admin']), getStudentById);
// router.put("/updatestudent/:id", authMiddleware(["admin"]),singleUpload, adminUpdateStudent);

// // router.get("/viewstudent/class/:classId", authMiddleware(["admin"]), getStudentsByClass);

// // Get all students of a class
// router.get("/viewstudent/:classId/students", authMiddleware(["admin"]), getStudentsByClass);

// // Get students of a specific section
// router.get("/viewstudent/:classId/sections/:sectionId/students", authMiddleware(["admin"]), getStudentsByClass);







// // Admin can manage teachers
// router.post("/createteacher", authMiddleware(["admin"]),singleUpload,  createTeacher);
// router.get("/viewteacher", authMiddleware(["admin"]), getTeachers);
// router.delete("/deleteteacher/:id", authMiddleware(["admin"]), deleteTeacher);
// // PUT /admin/teacher/:id
// router.put("/updateteacher/:id", authMiddleware(["admin"]),singleUpload, adminUpdateTeacher);
// router.get('/viewteacher/:id', authMiddleware(['admin']), getTeacherById);

// router.get('/subject/:subjectId',authMiddleware(['admin']),getTeachersBySubject);

// router.get('/subject/:subjectId/details',authMiddleware(['admin']),getTeachersBySubjectEmbedded);

// export default router;
