
import mongoose from "mongoose";
import { Exam } from "../models/examModel.js";
import { ExamResult } from "../models/examResultModel.js";
import { Announcement } from "../models/announcementModel.js";

/**
 * Create exam (Admin only)
 */
export const createExam = async (req, res) => {
  try {
    const { classId, sectionId, ...rest } = req.body;

    if (!classId || !sectionId) {
      return res.status(400).json({ success: false, message: "Class and Section are required" });
    }

    const payload = {
      ...rest,
      createdBy: req.user.id,
      assignments: [{ classId, sectionId }] // add assignments array
    };

    const exam = await Exam.create(payload);

    return res.status(201).json({
      success: true,
      message: "Exam created successfully",
      exam
    });
  } catch (err) {
    console.error("createExam:", err);
    return res.status(500).json({
      success: false,
      message: `Error creating exam: ${err.message}`
    });
  }
};


export const addSubjectExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { subjectId, maxMarks, passingMarks, date, startTime, endTime, roomId, teacherId } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

    exam.subjects.push({ subjectId, maxMarks, passingMarks, date, startTime, endTime, roomId, teacherId });
    await exam.save();

    return res.status(201).json({ success: true, message: "Subject exam added", exam });
  } catch (err) {
    console.error("addSubjectExam:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const updateSubjectExam = async (req, res) => {
  try {
    const { examId, subjectExamId } = req.params;
    const updates = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

    const subExam = exam.subjects.id(subjectExamId);
    if (!subExam) return res.status(404).json({ success: false, message: "Subject exam not found" });

    Object.assign(subExam, updates);
    await exam.save();

    return res.json({ success: true, message: "Subject exam updated", exam });
  } catch (err) {
    console.error("updateSubjectExam:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const deleteSubjectExam = async (req, res) => {
  try {
    const { examId, subjectExamId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

    // Find the subdocument
    const subExam = exam.subjects.id(subjectExamId);
    if (!subExam) return res.status(404).json({ success: false, message: "Subject exam not found" });

    // Delete the subdocument
    subExam.deleteOne(); // <- Use deleteOne instead of remove
    await exam.save();

    return res.json({ success: true, message: "Subject exam deleted", exam });
  } catch (err) {
    console.error("deleteSubjectExam:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};



/**
 * Update exam (Admin only)
 */
export const updateExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const updated = await Exam.findByIdAndUpdate(examId, { ...req.body }, { new: true });
    if (!updated) return res.status(404).json({
      success: false,
      message: "Exam not found"
    });
    return res.json({
      success: true,
      message: "Exam updated successfully",
      exam: updated
    });
  } catch (err) {
    console.error("updateExam:", err);
    return res.status(500).json({
      success: false,
      message: `Error updating exam: ${err.message}`
    });
  }
};

/**
 * Delete exam (Admin only) — also deletes related results
 */
export const deleteExam = async (req, res) => {
  try {
    const examId = req.params.id;
    await Exam.findByIdAndDelete(examId);
    await ExamResult.deleteMany({ examId });
    return res.json({
      success: true,
      message: "Exam and related results deleted"
    });
  } catch (err) {
    console.error("deleteExam:", err);
    return res.status(500).json({
      success: false,
      message: `Error deleting exam: ${err.message}`
    });
  }
};

/**
 * List exams (filter by classId/sectionId optional)
 */
export const listExams = async (req, res) => {
  try {
    const { classId, sectionId } = req.query;
    const filter = {};
    if (classId) filter["assignments.classId"] = classId;
    if (sectionId) filter["assignments.sectionId"] = sectionId;

    const exams = await Exam.find(filter)
      .sort({ startDate: -1 })
      .populate("assignments.classId", "name")   // populate classId with only name
      .populate("assignments.sectionId", "name") // populate sectionId with only name
      .lean();

    return res.json({ success: true, exams });
  } catch (err) {
    console.error("listExams:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


/**
 * Get single exam
 */
export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate("subjects.subjectId", "name code") // subject details
      .populate("subjects.roomId", "name")         // room details
      .populate("subjects.teacherId", "name")      // teacher details
      .populate("assignments.classId assignments.sectionId assignments.classTeacherId", "name"); // assignment details

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }

    return res.json({
      success: true,
      exam
    });
  } catch (err) {
    console.error("getExamById:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};



// Toggle exam publish/unpublish
export const togglePublishExam = async (req, res) => {
  try {
    const examId = req.params.id;

    // Find exam
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({
      success: false,
      message: "Exam not found"
    });

    // Toggle the publish status
    exam.isPublished = !exam.isPublished;
    await exam.save();

    // Create announcement only if publishing
    if (exam.isPublished) {
      try {
        await Announcement.create({
          title: `Exam Published: ${exam.title}`,
          message: `The exam "${exam.title}" has been published. Please check the schedule.`,
          target: ["admin","student", "teacher"],
          createdBy: req.user.id, // ensure auth middleware sets req.user.id
        });
      } catch (annErr) {
        console.warn("togglePublishExam: announcement creation failed", annErr.message);
      }
    }

    return res.json({
      success: true,
      message: exam.isPublished ? "Exam published" : "Exam unpublished",
      exam,
    });
  } catch (err) {
    console.error("togglePublishExam:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
