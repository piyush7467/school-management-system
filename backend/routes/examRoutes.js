// routes/examRoutes.js
import express from "express";
import { addSubjectExam, createExam, deleteExam, deleteSubjectExam, getExamById, listExams, togglePublishExam, updateExam, updateSubjectExam } from "../controllers/examController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";



const router = express.Router();

// Admin-only routes
router.post("/create", authMiddleware(["admin"]), createExam);
router.put("/:id/update", authMiddleware(["admin"]), updateExam);
router.delete("/:id/delete", authMiddleware(["admin"]), deleteExam);
router.put("/:id/publish", authMiddleware(["admin"]), togglePublishExam);

// Authenticated reads (admins/teachers/students) — adjust roles if you want open access
router.get("/getall", authMiddleware(), listExams);
router.get("/:id/get", authMiddleware(), getExamById);

//subject
router.post("/:examId/subject/add", authMiddleware(["admin"]), addSubjectExam);
router.put("/:examId/subject/:subjectExamId/update", authMiddleware(["admin"]), updateSubjectExam);
router.delete("/:examId/subject/:subjectExamId/delete", authMiddleware(["admin"]), deleteSubjectExam);
router.get("/:examId/subjects", authMiddleware(), getExamById); // Already returns subjects


export default router;
