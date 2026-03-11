import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  // Classes
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,

  // Sections
  addSectionToClass,
  updateSection,
  deleteSection,
  getClassSectionDetails,

  // Students
  assignStudentsToSection,
  removeStudentFromSection,

  // Teachers
  assignTeacherToSection,
  removeTeacherFromSection,

  // Subjects
  addSubjectsToSection,
  getSubjectsForSection,
  createSubject,
  getAllSubjects,
} from "../controllers/classController.js";

const router = express.Router();

// ------------------ CLASS ROUTES ------------------
router.post("/create", authMiddleware(["admin"]), createClass); // Create class
router.get("/", authMiddleware(["admin"]), getAllClasses);     // Get all classes
router.get("/:classId", authMiddleware(["admin"]), getClassById); // Get class by ID
router.put("/:classId/update", authMiddleware(["admin"]), updateClass);  // Update class
router.delete("/:classId/delete", authMiddleware(["admin"]), deleteClass); // Delete class

// ------------------ SECTION ROUTES ------------------
// Add a section to a class
router.post("/:classId/sections", authMiddleware(["admin"]), addSectionToClass);
// Update a section
router.put("/sections/:sectionId", authMiddleware(["admin"]), updateSection);
// Delete a section
router.delete("/:classId/sections/:sectionId/delete", authMiddleware(["admin"]), deleteSection);
// Get all sections of a class
router.get("/:classId/sections", authMiddleware(["admin"]), getClassSectionDetails);
// Get single section of a class
router.get("/:classId/sections/:sectionId", authMiddleware(["admin"]), getClassSectionDetails);

// ------------------ STUDENT ASSIGNMENT ROUTES ------------------
router.post("/:classId/sections/:sectionId/assign-student", authMiddleware(["admin"]), assignStudentsToSection); // Assign students
router.delete("/sections/:sectionId/students/:studentId", authMiddleware(["admin"]), removeStudentFromSection); // Remove student

// ------------------ TEACHER ASSIGNMENT ROUTES ------------------
router.post("/:classId/sections/:sectionId/assign-teacher", authMiddleware(["admin"]), assignTeacherToSection); // Assign teacher to subject
router.delete("/sections/:sectionId/remove-teacher", authMiddleware(["admin"]), removeTeacherFromSection); // Remove teacher from subject

// ------------------ SUBJECT ROUTES ------------------
// Subjects collection
router.post("/:classId/subjects", authMiddleware(["admin"]), createSubject); // Create new subject
router.get("/:classId/subjects", authMiddleware(["admin"]), getAllSubjects); // Get all subjects
// router.get("/subjectglobal", authMiddleware(["admin"]), getAllSubjectsGlobal); 

// Assign subjects to a section
router.post("/:classId/sections/:sectionId/subjects", authMiddleware(["admin"]), addSubjectsToSection);
// Get subjects + teachers for a section
router.get("/sections/:sectionId/subjects", authMiddleware(["admin", "teacher"]), getSubjectsForSection);

export default router;











// import express from "express";
// import { authMiddleware } from "../middleware/authMiddleware.js";
// import { addSectionToClass, addSubjectsToSection, assignStudentsToSection, assignTeacherToSection,   createClass,   deleteClass, deleteSection, getAllClasses, getClassById, getSubjectsForSection, removeStudentFromSection, removeTeacherFromSection, updateClass, updateSection } from "../controllers/classController.js";

// const router = express.Router();

// // ------------------ Class Routes ------------------
// // Admin creates and views classes
// router.post("/createclass", authMiddleware(["admin"]), createClass);
// router.get("/getclass", authMiddleware(["admin"]), getAllClasses);
// router.get("/:classId", authMiddleware(["admin"]), getClassById);
// router.put("/:classId", authMiddleware(["admin"]), updateClass);
// router.delete("/delete/:classId", authMiddleware(["admin"]), deleteClass);

// // ------------------ Section Routes ------------------
// // Admin adds a section to a class
// router.post("/:classId/sections", authMiddleware(["admin"]), addSectionToClass);
// router.put("/:classId/sections/:sectionId", authMiddleware(["admin"]), updateSection);
// router.delete("/:classId/sections/:sectionId", authMiddleware(["admin"]), deleteSection);

// // ------------------ Assignment Routes ------------------
// // Assign students to a section
// router.post("/:classId/sections/:sectionId/assign-students", authMiddleware(["admin"]), assignStudentsToSection);
// // remove students to a section
// router.post("/:classId/sections/:sectionId/remove-students", authMiddleware(["admin"]), removeStudentFromSection);

// // Assign teachers to a section
// router.post("/:classId/sections/:sectionId/assign-teacher", authMiddleware(["admin"]), assignTeacherToSection);
// router.post("/:classId/sections/:sectionId/remove-teacher", authMiddleware(["admin"]), removeTeacherFromSection);


// // assign subjects to a section 
// router.post("/:classId/sections/:sectionId/assign-subject", authMiddleware(["admin"]), addSubjectsToSection);

// router.get("/:classId/sections/:sectionId/subjects", authMiddleware(["admin"]), getSubjectsForSection);




// export default router;
