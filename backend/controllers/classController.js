import { Class } from "../models/classModel.js";
import { Section } from "../models/SectionModel.js";
import { Student } from "../models/studentModel.js";
import { Teacher } from "../models/teacherModel.js";
import { Subject } from "../models/subjectModel.js";
import mongoose from "mongoose";
/**
 * Create a new class
 */
export const createClass = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existing = await Class.findOne({ name });
    if (existing)
      return res.status(400).json({ success: false, message: "Class already exists" });

    const newClass = new Class({ name, description });
    await newClass.save();

    res.status(201).json({ success: true, message: "Class created successfully", data: newClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all classes with sections and student/teacher counts
 */

export const getAllClasses = async (req, res) => {
  try {
    // Fetch all classes
    const classes = await Class.find().lean();

    const results = await Promise.all(
      classes.map(async (cls) => {
        // Fetch all sections for this class
        const sections = await Section.find({ classId: cls._id })
          .populate("classTeacher", "name email")
          .lean();

        // For each section, count students & resolve subjects
        const enrichedSections = await Promise.all(
          sections.map(async (section) => {
            const studentCount = await Student.countDocuments({ sectionId: section._id });

            // Resolve teacher details for each subject
            const enrichedSubjects = await Promise.all(
              (section.subjects || []).map(async (sub) => {
                const teachers = await Teacher.find(
                  { _id: { $in: sub.teachers } },
                  "name email"
                ).lean();

                return {
                  ...sub,
                  teachers,
                };
              })
            );

            return {
              ...section,
              studentCount,
              subjects: enrichedSubjects,
            };
          })
        );

        return {
          ...cls,
          sections: enrichedSections,
        };
      })
    );

    res.status(200).json({
      success: true,
      totalClasses: results.length,
      classes: results,
    });
  } catch (error) {
    console.error("Error in getAllClasses:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// export const getAllClasses = async (req, res) => {
//   try {
//     const classes = await Class.find().lean();

//     const result = await Promise.all(
//       classes.map(async (cls) => {
//         const sections = await Section.find({ classId: cls._id })
//           .populate("classTeacher", "name email")
//           .lean();

//         for (const sec of sections) {
//           sec.studentCount = await Student.countDocuments({ sectionId: sec._id });
//           sec.subjects = await Promise.all(
//             sec.subjects?.map(async (sub) => {
//               const teachers = await Teacher.find({ _id: { $in: sub.teachers } }, "name email");
//               return { ...sub, teachers };
//             }) || []
//           );
//         }

//         return { ...cls, sections };
//       })
//     );

//     res.json({ success: true, totalClasses: result.length, classes: result });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

/**
 * Get single class by ID
 */
export const getClassById = async (req, res) => {
  try {
    const { classId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ success: false, message: "Invalid classId" });
    }

    const cls = await Class.findById(classId).lean();
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });

    const sections = await Section.find({ classId: cls._id })
      .populate("classTeacher", "name email")
      .lean();

    for (const sec of sections) {
      // Populate students in this section
      const students = await Student.find({ sectionId: sec._id }, "firstName lastName username").lean();
      sec.students = students;

      // Populate subjects with teachers
      sec.subjects = await Promise.all(
        sec.subjects?.map(async (sub) => {
          const teachers = await Teacher.find({ _id: { $in: sub.teachers } }, "name email");
          const subject = await Subject.findById(sub.subjectId, "name");
          return {
            subjectId: sub.subjectId,
            subjectName: subject?.name || "Unknown Subject",
            teachers,
          };
        }) || []
      );
    }

    res.json({ success: true, data: { ...cls, sections } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};




// export const getClassById = async (req, res) => {
//   try {
//     const { classId } = req.params;

//     // Fetch class
//     const cls = await Class.findById(classId).lean();
//     if (!cls) return res.status(404).json({ success: false, message: "Class not found" });

//     // Fetch sections for this class
//     const sections = await Section.find({ classId: cls._id })
//       .populate("classTeacher", "name email")
//       .lean();

//     // Enhance each section
//     for (const sec of sections) {
//       // Count students in section
//       sec.studentCount = await Student.countDocuments({ sectionId: sec._id });

//       // Populate subjects with teachers and subject names
//       sec.subjects = await Promise.all(
//         sec.subjects?.map(async (sub) => {
//           // Populate teachers
//           const teachers = await Teacher.find({ _id: { $in: sub.teachers } }, "name email");

//           // Populate subject name
//           const subject = await Subject.findById(sub.subjectId, "name");

//           return {
//             subjectId: sub.subjectId,
//             subjectName: subject?.name || "Unknown Subject",
//             teachers,
//           };
//         }) || []
//       );
//     }

//     // Return class with sections
//     res.json({ success: true, data: { ...cls, sections } });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// export const getClassById = async (req, res) => {
//   try {
//     const { classId } = req.params;
//     const cls = await Class.findById(classId).lean();
//     if (!cls) return res.status(404).json({ success: false, message: "Class not found" });

//     const sections = await Section.find({ classId: cls._id })
//       .populate("classTeacher", "name email")
//       .lean();

//     for (const sec of sections) {
//       sec.studentCount = await Student.countDocuments({ sectionId: sec._id });
//       sec.subjects = await Promise.all(
//         sec.subjects?.map(async (sub) => {
//           const teachers = await Teacher.find({ _id: { $in: sub.teachers } }, "name email");
//           return { ...sub, teachers };
//         }) || []
//       );
//     }

//     res.json({ success: true, data: { ...cls, sections } });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

/**
 * Update class
 */
export const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { name, description } = req.body;

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });

    cls.name = name || cls.name;
    cls.description = description || cls.description;

    await cls.save();
    res.json({ success: true, message: "Class updated successfully", data: cls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete class + sections + remove student refs
 */
export const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const cls = await Class.findByIdAndDelete(classId);
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });

    await Section.deleteMany({ classId });
    await Student.updateMany({ classId }, { $unset: { classId: "", sectionId: "" } });

    res.json({ success: true, message: "Class and related sections deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Add section to class
 */
export const addSectionToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { name, classTeacherId } = req.body;

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });

    const existing = await Section.findOne({ classId, name });
    if (existing) return res.status(400).json({ success: false, message: "Section already exists in this class" });

    const section = new Section({ name, classId, classTeacher: classTeacherId });
    await section.save();

    res.status(201).json({ success: true, message: "Section added", data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update section
 */
export const updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { name, classTeacherId } = req.body;

    const section = await Section.findById(sectionId);
    if (!section) return res.status(404).json({ success: false, message: "Section not found" });

    section.name = name || section.name;
    section.classTeacher = classTeacherId || section.classTeacher;

    await section.save();
    res.json({ success: true, message: "Section updated", data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete section
 */
export const deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const section = await Section.findByIdAndDelete(sectionId);
    if (!section) return res.status(404).json({ success: false, message: "Section not found" });

    await Student.updateMany({ sectionId }, { $unset: { sectionId: "" } });

    res.json({ success: true, message: "Section deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Assign students to section
 */
export const assignStudentsToSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: "No students provided" });
    }

    // ✅ Check if section exists
    const section = await Section.findById(sectionId);
    if (!section) return res.status(404).json({ success: false, message: "Section not found" });

    // ✅ Make sure students exist
    const validStudents = await Student.find({ _id: { $in: studentIds } });
    if (validStudents.length === 0)
      return res.status(404).json({ success: false, message: "No valid students found" });

    // ✅ Avoid duplicates
    const existingIds = section.students.map((id) => id.toString());
    const newStudents = validStudents
      .map((s) => s._id.toString())
      .filter((id) => !existingIds.includes(id));

    // ✅ Add new students to section
    section.students.push(...newStudents);
    await section.save();

    // ✅ Update students with section and class references
    await Student.updateMany(
      { _id: { $in: newStudents } },
      { sectionId: section._id, classId: section.classId }
    );

    // ✅ Populate for frontend
    const populatedSection = await Section.findById(sectionId)
      .populate("classId", "name")
      .populate("students", "name email");

    res.json({
      success: true,
      message: "Students assigned successfully",
      data: populatedSection,
    });
  } catch (error) {
    console.error("Error in assignStudentsToSection:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Remove student from section
 */
export const removeStudentFromSection = async (req, res) => {
  try {
    const { sectionId, studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sectionId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const section = await Section.findById(sectionId);
    if (!section) return res.status(404).json({ success: false, message: "Section not found" });

    // Remove student from section
    await Section.findByIdAndUpdate(sectionId, { $pull: { students: studentId } });

    // Only remove section reference from student, keep classId intact
    await Student.findByIdAndUpdate(studentId, { $unset: { sectionId: "" } });

    // Fetch updated section with populated students
    const updatedSection = await Section.findById(sectionId)
      .populate("classId", "name")
      .populate("students", "firstName lastName username email");

    res.json({
      success: true,
      message: "Student removed from section successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.error("Error in removeStudentFromSection:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



/**
 * Create a new subject
 */
export const createSubject = async (req, res) => {
  try {
    const { name, code } = req.body;

    const existing = await Subject.findOne({ $or: [{ code }, { name }] });
    if (existing)
      return res.status(400).json({ success: false, message: "Subject already exists" });

    const newSubject = new Subject({ name, code });
    await newSubject.save();

    res.status(201).json({ success: true, message: "Subject created successfully", data: newSubject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all subjects
 */
// export const getAllSubjects = async (req, res) => {
//   try {
//     const { classId } = req.params;

//     let subjects;

//     if (classId) {
//       // Fetch subjects assigned to this class
//       const classData = await Class.findById(classId).populate("subjects").lean();
//       if (!classData) return res.status(404).json({ success: false, message: "Class not found" });

//       subjects = classData.subjects || [];
//     } else {
//       // Fetch all subjects (fallback)
//       subjects = await Subject.find().lean();
//     }

//     res.json({ success: true, total: subjects.length, subjects });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().lean();
    res.json({ success: true, total: subjects.length, subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};





// export const getAllSubjectsGlobal = async (req, res) => {
//   try {
//     const subjects = await Subject.find().lean(); // fetch all subjects
//     res.status(200).json({ success: true, total: subjects.length, subjects });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

/**
 * Add subjects to section
 */
export const addSubjectsToSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    let { subjectIds } = req.body;

    if (!Array.isArray(subjectIds)) subjectIds = [subjectIds];

    const section = await Section.findById(sectionId);
    if (!section) return res.status(404).json({ success: false, message: "Section not found" });

    if (!Array.isArray(section.subjects)) section.subjects = [];

    const validSubjects = await Subject.find({ _id: { $in: subjectIds } }).select("_id");
    const validIds = validSubjects.map((s) => s._id.toString());

    validIds.forEach((subId) => {
      if (!section.subjects.some((sub) => sub.subjectId.toString() === subId)) {
        section.subjects.push({ subjectId: subId, teachers: [] }); // <-- change here
      }
    });

    await section.save();
    res.json({ success: true, message: "Subjects added successfully", data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};





export const assignTeacherToSection = async (req, res) => {
  try {
    const { teacherId, subjectId } = req.body;
    const { sectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(teacherId) || !mongoose.Types.ObjectId.isValid(sectionId)) {
      return res.status(400).json({ success: false, message: "Invalid teacher or section ID" });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

    const section = await Section.findById(sectionId);
    if (!section) return res.status(404).json({ success: false, message: "Section not found" });

    // Find the subject in section
    const subject = section.subjects.find(sub => sub.subjectId.toString() === subjectId);
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found in section" });

    // Assign teacher to subject
    if (!subject.teachers.includes(teacherId)) {
      subject.teachers.push(teacherId);
    }

    await section.save();

    // Add class-section mapping in teacher model if not already present
    const alreadyAssigned = teacher.classSections.some(
      cs => cs.class?.toString() === section.classId.toString() &&
            cs.section?.toString() === section._id.toString()
    );
    if (!alreadyAssigned) {
      teacher.classSections.push({ class: section.classId, section: section._id });
    }

    await teacher.save();

    res.status(200).json({
      success: true,
      message: "Teacher assigned to section successfully",
      data: teacher,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};



/**
 * ✅ Remove teacher from a specific subject, class, and section
 */

export const removeTeacherFromSection = async (req, res) => {
  try {
    const { teacherId, removals } = req.body;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ success: false, message: "Invalid teacher ID" });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

    for (const { sectionId, subjectIds } of removals) {
      if (!mongoose.Types.ObjectId.isValid(sectionId)) continue;

      const section = await Section.findById(sectionId);
      if (!section) continue;

      for (const subjectId of subjectIds) {
        if (!mongoose.Types.ObjectId.isValid(subjectId)) continue;

        const subject = section.subjects.find(sub => sub.subjectId.toString() === subjectId.toString());
        if (!subject) continue;

        subject.teachers = subject.teachers.filter(t => t.toString() !== teacherId.toString());
      }

      await section.save();

      // Remove class-section from teacher if no subjects remain in that section
      const stillAssigned = section.subjects.some(sub => sub.teachers.includes(teacherId));
      if (!stillAssigned) {
        teacher.classSections = teacher.classSections.filter(
          cs => !(cs.class?.toString() === section.classId.toString() &&
                  cs.section?.toString() === section._id.toString())
        );
      }
    }

    await teacher.save();

    res.status(200).json({
      success: true,
      message: "Teacher removed from sections successfully",
      data: teacher,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};




// export const removeTeacherFromSection = async (req, res) => {
//   try {
//     const { sectionId } = req.params;
//     const { subjectId, teacherId } = req.body;

//     // Validate IDs
//     if (!mongoose.Types.ObjectId.isValid(sectionId) ||
//         !mongoose.Types.ObjectId.isValid(subjectId) ||
//         !mongoose.Types.ObjectId.isValid(teacherId)) {
//       return res.status(400).json({ success: false, message: "Invalid IDs provided" });
//     }

//     // Find section
//     const section = await Section.findById(sectionId);
//     if (!section)
//       return res.status(404).json({ success: false, message: "Section not found" });

//     // Find subject
//     const subject = section.subjects.find(
//       (sub) => sub.subjectId.toString() === subjectId.toString()
//     );
//     if (!subject)
//       return res.status(404).json({ success: false, message: "Subject not found" });

//     // Remove teacher from section's subject
//     subject.teachers = subject.teachers.filter(t => t.toString() !== teacherId.toString());
//     await section.save();

//     // Update Teacher document: remove class and section if this assignment is removed
//     const teacher = await Teacher.findById(teacherId);
//     if (teacher) {
//       // Only remove class/section if teacher no longer teaches any subject in this section
//       const stillAssigned = section.subjects.some(sub =>
//         sub.teachers.map(t => t.toString()).includes(teacherId.toString())
//       );

//       if (!stillAssigned) {
//         // Remove class and section assignment
//         teacher.class = null;
//         teacher.section = null;

//         // Optionally remove subject from teacher.subjects
//         teacher.subjects = teacher.subjects.filter(sId => sId.toString() !== subjectId.toString());

//         await teacher.save();
//       }
//     }

//     // Populate teacher names for frontend
//     await section.populate("subjects.teachers", "name");

//     res.json({ success: true, message: "Teacher removed from section", section, teacher });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };




// export const removeTeacherFromSection = async (req, res) => {
//   try {
//     const { sectionId } = req.params;
//     const { subjectId, teacherId } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(sectionId) ||
//         !mongoose.Types.ObjectId.isValid(subjectId) ||
//         !mongoose.Types.ObjectId.isValid(teacherId)) {
//       return res.status(400).json({ success: false, message: "Invalid IDs provided" });
//     }

//     const section = await Section.findById(sectionId);
//     if (!section)
//       return res.status(404).json({ success: false, message: "Section not found" });

//     const subject = section.subjects.find(
//       (sub) => sub.subjectId.toString() === subjectId.toString()
//     );
//     if (!subject)
//       return res.status(404).json({ success: false, message: "Subject not found" });

//     // Remove teacher safely
//     subject.teachers = subject.teachers.filter(t => t.toString() !== teacherId.toString());

//     await section.save();

//     // Populate teacher names for frontend
//     await section.populate("subjects.teachers", "name");

//     res.json({ success: true, message: "Teacher removed", data: section });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };




/**
 * Get subjects + teachers for section
 */
export const getSubjectsForSection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const section = await Section.findById(sectionId)
      .populate("subjects.subjectId", "name code")
      .populate("subjects.teachers", "name email");

    if (!section) return res.status(404).json({ success: false, message: "Section not found" });

    res.json({ success: true, subjects: section.subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get class section details
 */

export const getClassSectionDetails = async (req, res) => {
  try {
    const { classId, sectionId } = req.params;

    // Fetch the class
    const cls = await Class.findById(classId).lean();
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });

    // Build query for sections
    let sectionsQuery = { classId: cls._id };
    if (sectionId) sectionsQuery._id = sectionId;

    // Fetch sections with subjects & teachers populated
    const sections = await Section.find(sectionsQuery)
      .populate("classTeacher", "name email")
      .populate("students", "name email")
      .populate({
        path: "subjects.subjectId",
        model: "Subject",
        select: "name code",
      })
      .populate({
        path: "subjects.teachers",
        model: "Teacher",
        select: "name email",
      });

    if (!sections || sections.length === 0) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }

    // Map result for frontend
    const result = sections.map((sec) => ({
      sectionId: sec._id,
      sectionName: sec.name,
      classTeacher: sec.classTeacher,
      studentCount: sec.students.length,
      students: sec.students,
      subjects: sec.subjects.map((sub) => ({
        subjectId: sub.subjectId?._id,
        subjectName: sub.subjectId?.name,
        subjectCode: sub.subjectId?.code,
        teachers: sub.teachers.map((t) => ({
          teacherId: t._id,
          name: t.name,
          email: t.email,
        })),
      })),
    }));

    res.json({ success: true, classId: cls._id, className: cls.name, sections: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// export const getClassSectionDetails = async (req, res) => {
//   try {
//     const { classId, sectionId } = req.params;

//     const cls = await Class.findById(classId).lean();
//     if (!cls) return res.status(404).json({ success: false, message: "Class not found" });

//     let sectionsQuery = { classId: cls._id };
//     if (sectionId) sectionsQuery._id = sectionId;

//     const sections = await Section.find(sectionsQuery)
//       .populate("classTeacher", "name email")
//       .populate("students", "name email")
//       .populate("subjects.subject", "name code")
//       .populate("subjects.teachers", "name email");

//     if (!sections || sections.length === 0) {
//       return res.status(404).json({ success: false, message: "Section not found" });
//     }

//     const result = sections.map((sec) => ({
//       sectionId: sec._id,
//       sectionName: sec.name,
//       classTeacher: sec.classTeacher,
//       studentCount: sec.students.length,
//       students: sec.students,
//       subjects: sec.subjects.map((sub) => ({
//         subject: sub.subject,
//         teachers: sub.teachers,
//       })),
//     }));

//     res.json({ success: true, class: cls.name, sections: result });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

