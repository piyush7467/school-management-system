import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Teacher } from "../models/teacherModel.js";
import { Subject } from "../models/subjectModel.js"; // import Subject model if needed
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";
import { Class } from "../models/classModel.js";
import { Section } from "../models/SectionModel.js";

import {Student} from "../models/studentModel.js";


// ---------------- ADMIN CONTROLS ----------------

// ✅ Create Teacher (Admin only) - subjects only, no class/section yet
// export const createTeacher = async (req, res) => {
//   try {
//     let {
//       username,
//       name,
//       password,
//       subjects, // can be array or JSON string
//       email,
//       phone,
//       address,
//       employeeId,
//       qualification,
//       experience,
//       gender,
//       dob,
//       emergencyContact
//     } = req.body;

//     const adminId = req.user.id;
//     if (!adminId) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     if (!username || !name || !password) {
//       return res.status(400).json({ success: false, message: "Required fields missing" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ✅ Fix subjects (string → JSON → array)
//     let validSubjects = [];
//     if (subjects) {
//       if (typeof subjects === "string") {
//         try {
//           subjects = JSON.parse(subjects);
//         } catch (err) {
//           return res.status(400).json({ success: false, message: "Invalid subjects format" });
//         }
//       }

//       if (Array.isArray(subjects)) {
//         for (const subId of subjects) {
//           const subDoc = await Subject.findById(subId);
//           if (!subDoc) {
//             return res.status(404).json({ success: false, message: `Subject ${subId} not found` });
//           }
//           validSubjects.push(subId);
//         }
//       }
//     }

//     const teacher = new Teacher({
//       username,
//       name,
//       password: hashedPassword,
//       subjects: validSubjects,
//       email: email || "",
//       phone: phone || "",
//       address: address || "",
//       employeeId: employeeId || "",
//       qualification: qualification || "",
//       experience: experience || 0,
//       gender: gender || "",
//       dob: dob || null,
//       emergencyContact: emergencyContact || "",
//       joiningDate: new Date(),
//       createdBy: adminId,
//       status: "active",
//       isEmailVerified: false,
//     });

//     await teacher.save();

//     res.status(201).json({
//       success: true,
//       message: "Teacher created successfully",
//       teacher,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: `Failed to create teacher: ${err.message}`,
//     });
//   }
// };


export const createTeacher = async (req, res) => {
  try {
    const { username, name, password, subjects, email, phone, address, employeeId,
      qualification, experience, gender, dob, emergencyContact, joiningDate, aadharNo,
    } = req.body;

    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    // Required fields
    if (!username || !name || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Required fields missing" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle subjects (array of IDs)
    let validSubjects = [];
    if (subjects) {
      let subjectArray = subjects;
      if (typeof subjects === "string") {
        try {
          subjectArray = JSON.parse(subjects);
        } catch {
          return res.status(400).json({ success: false, message: "Invalid subjects format" });
        }
      }

      for (const subId of subjectArray) {
        const subDoc = await Subject.findById(subId);
        if (!subDoc) {
          return res.status(404).json({ success: false, message: `Subject ${subId} not found` });
        }
        validSubjects.push(subId);
      }
    }

    // Handle profile picture upload
    let profilePic;
    if (req.file) {
      const fileUri = getDataUri(req.file);
      const upload = await cloudinary.uploader.upload(fileUri.content);
      profilePic = upload.secure_url;
    }

    // Prepare teacher data
    const teacherData = {
      username,
      name,
      password: hashedPassword,
      subjects: validSubjects,
      email,
      phone,
      address,
      qualification,
      experience,
      gender,
      dob: dob ? new Date(dob) : undefined,
      emergencyContact,
      joiningDate: joiningDate ? new Date(joiningDate) : undefined, // admin-provided
      createdBy: adminId,
      profilePic,
      aadharNo,
    };

    if (employeeId && employeeId.trim() !== "") {
      teacherData.employeeId = employeeId.trim();
    }

    // Create teacher
    const teacher = await Teacher.create(teacherData);

    res.status(201).json({ success: true, message: "Teacher created successfully", teacher });
  } catch (err) {
    // Handle duplicate key error
    if (err.code === 11000) {
      const dupKey = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${dupKey} "${err.keyValue[dupKey]}" already exists.`,
      });
    }

    res.status(500).json({ success: false, message: `Failed to create teacher: ${err.message}` });
  }
};




// ✅ Get all teachers
// ✅ Get all teachers
// export const getTeachers = async (req, res) => {
//   try {
//     const teachers = await Teacher.find()
//       .select("-password")
//       .populate("subjects", "name code")
//       .populate("classSections.class", "name")
//       .populate("classSections.section", "name");

//     res.status(200).json({ success: true, total: teachers.length, teachers });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const getTeacherById = async (req, res) => {
//   try {
//     const teacher = await Teacher.findById(req.params.id)
//       .select("-password")
//       .populate("subjects", "name code")
//       .populate("classSections.class", "name")
//       .populate("classSections.section", "name");

//     if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

//     res.status(200).json({ success: true, teacher });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


// controllers/teacherController.js

export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .select("-password")
      .populate("subjects", "name code")
      .populate("classSections.class", "name")
      .populate("classSections.section", "name");

    // Transform data for easier frontend usage
    const formattedTeachers = teachers.map(t => {
      const obj = t.toObject();
      obj.subjectsList = obj.subjects?.map(s => s.name).join(", ") || "N/A";
      obj.classList = obj.classSections?.map(cs => cs.class?.name).join(", ") || "N/A";
      obj.sectionList = obj.classSections?.map(cs => cs.section?.name).join(", ") || "N/A";
      return obj;
    });

    res.status(200).json({ success: true, total: formattedTeachers.length, teachers: formattedTeachers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .select("-password")
      .populate("subjects", "name code")
      .populate("classSections.class", "name")
      .populate("classSections.section", "name");

    if (!teacher)
      return res.status(404).json({ success: false, message: "Teacher not found" });

    const teacherData = teacher.toObject();
    teacherData.subjectsList = teacherData.subjects?.map(s => s.name).join(", ") || "N/A";
    teacherData.classList = teacherData.classSections?.map(cs => cs.class?.name).join(", ") || "N/A";
    teacherData.sectionList = teacherData.classSections?.map(cs => cs.section?.name).join(", ") || "N/A";

    res.status(200).json({ success: true, teacher: teacherData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// ✅ Update teacher (Admin only) - subjects only
// export const adminUpdateTeacher = async (req, res) => {
//   try {
//     const teacherId = req.params.id;
//     let {
//       name,
//       email,
//       phone,
//       address,
//       employeeId,
//       qualification,
//       experience,
//       gender,
//       dob,
//       emergencyContact,
//       status,
//       subjects,
//       class: className,
//       section
//     } = req.body;
//     const file=req.file;

//     const teacher = await Teacher.findById(teacherId);
//     if (!teacher) {
//       return res.status(404).json({ success: false, message: "Teacher not found" });
//     }

//     // ✅ Collect updates safely
//     const updates = {
//       name,
//       email,
//       phone,
//       address,
//       employeeId,
//       qualification,
//       experience,
//       gender,
//       dob,
//       emergencyContact,
//       status,
//       class: className,
//       section,
//       subjects: undefined // will handle below
//     };

//     if (file) {
//           const fileUri = getDataUri(file);
//           const cloudResponse = await cloudinary.uploader.upload(fileUri);
//           updates.profilePic = cloudResponse.secure_url;
//         }

//     Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

//     // ✅ Handle subjects (string → array → validate)
//     if (subjects) {
//       if (typeof subjects === "string") {
//         try {
//           subjects = JSON.parse(subjects);
//         } catch (err) {
//           return res.status(400).json({ success: false, message: "Invalid subjects format" });
//         }
//       }

//       if (Array.isArray(subjects)) {
//         const validSubjects = [];
//         for (const subId of subjects) {
//           const subDoc = await Subject.findById(subId);
//           if (!subDoc) {
//             return res.status(404).json({ success: false, message: `Subject ${subId} not found` });
//           }
//           validSubjects.push(subId);
//         }
//         updates.subjects = validSubjects;
//       }
//     }

//     const updatedTeacher = await Teacher.findByIdAndUpdate(
//       teacherId,
//       { $set: updates },
//       { new: true, runValidators: true, select: "-password" }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Teacher updated successfully",
//       teacher: updatedTeacher
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: `Failed to update teacher: ${err.message}`
//     });
//   }
// };


// export const adminUpdateTeacher = async (req, res) => {
//   try {
//     const teacherId = req.params.id;
//     let {
//       name,
//       email,
//       phone,
//       address,
//       employeeId,
//       qualification,
//       experience,
//       gender,
//       dob,
//       emergencyContact,
//       status,
//       subjects,
//       class: classId,
//       section: sectionId
//     } = req.body;

//     const file = req.file;
//     const teacher = await Teacher.findById(teacherId);
//     if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

//     const updates = {
//       name,
//       email,
//       phone,
//       address,
//       employeeId,
//       qualification,
//       experience,
//       gender,
//       dob,
//       emergencyContact,
//       status,
//       class: classId,
//       section: sectionId,
//       subjects: undefined // handle below
//     };

//     if (file) {
//       const fileUri = getDataUri(file);
//       const cloudResponse = await cloudinary.uploader.upload(fileUri);
//       updates.profilePic = cloudResponse.secure_url;
//     }

//     // Handle subjects
//     if (subjects) {
//       if (typeof subjects === "string") subjects = JSON.parse(subjects);
//       if (Array.isArray(subjects)) {
//         const validSubjects = [];
//         for (const subId of subjects) {
//           const subDoc = await Subject.findById(subId);
//           if (!subDoc) return res.status(404).json({ success: false, message: `Subject ${subId} not found` });
//           validSubjects.push(subId);
//         }
//         updates.subjects = validSubjects;
//       }
//     }

//     const updatedTeacher = await Teacher.findByIdAndUpdate(
//       teacherId,
//       { $set: updates },
//       { new: true, runValidators: true, select: "-password" }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Teacher updated successfully",
//       teacher: updatedTeacher
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: `Failed to update teacher: ${err.message}` });
//   }
// };


export const adminUpdateTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;
    let {
      name,
      email,
      phone,
      address,
      employeeId,
      qualification,
      experience,
      gender,
      dob,
      emergencyContact,
      status,
      joiningDate,
      aadharNo,
      subjects,
      classSections, // array of { class, section }
    } = req.body;

    const file = req.file;

    // Find teacher
    const teacher = await Teacher.findById(teacherId);
    if (!teacher)
      return res.status(404).json({ success: false, message: "Teacher not found" });

    // Prepare updates
    const updates = {
      name,
      email,
      phone,
      address,
      employeeId: employeeId?.trim() || undefined,
      qualification,
      experience,
      gender,
      dob: dob ? new Date(dob) : undefined,
      emergencyContact,
      status,
      joiningDate: joiningDate ? new Date(joiningDate) : undefined,
      aadharNo,
    };

    // ✅ Handle subjects
    if (subjects) {
      if (typeof subjects === "string") subjects = JSON.parse(subjects);
      const validSubjects = [];
      for (const subId of subjects) {
        const subDoc = await Subject.findById(subId);
        if (!subDoc)
          return res
            .status(404)
            .json({ success: false, message: `Subject ${subId} not found` });
        validSubjects.push(subId);
      }
      updates.subjects = validSubjects;
    }

    // ✅ Handle classSections
    if (classSections) {
      if (typeof classSections === "string") classSections = JSON.parse(classSections);
      if (Array.isArray(classSections)) {
        updates.classSections = classSections.map((cs) => ({
          class: cs.class,
          section: cs.section,
        }));
      }
    }

    // ✅ Handle profile picture
    if (file) {
      const fileUri = getDataUri(file);
      const upload = await cloudinary.uploader.upload(fileUri.content);
      updates.profilePic = upload.secure_url;
    }

    // Update teacher
    const updatedTeacher = await Teacher.findByIdAndUpdate(teacherId, updates, {
      new: true,
      runValidators: true,
      select: "-password",
    })
      .populate("subjects", "name code")
      .populate("classSections.class", "name")
      .populate("classSections.section", "name");

    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      teacher: updatedTeacher,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to update teacher: ${err.message}`,
    });
  }
};




// ✅ Delete teacher
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

    await Teacher.findByIdAndDelete(teacher._id);
    res.status(200).json({ success: true, message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: `Failed to delete teacher: ${err.message}` });
  }
};

// ---------------- TEACHER SELF CONTROLS ----------------

// ✅ Teacher login
// export const teacherLogin = async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const teacher = await Teacher.findOne({ username }).populate("subjects", "name");
//     if (!teacher) return res.status(400).json({ success: false, message: "Teacher not found" });

//     const isMatch = await bcrypt.compare(password, teacher.password);
//     if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

//     const token = jwt.sign({ id: teacher._id, role: "teacher" }, process.env.SECRET_KEY, { expiresIn: "1d" });

//     res.status(200).json({
//       success: true,
//       message: `Welcome back ${teacher.name}`,
//       token,
//       teacher: {
//         id: teacher._id,
//         username: teacher.username,
//         name: teacher.name,
//         subjects: teacher.subjects,
//         email: teacher.email,
//         phone: teacher.phone,
//         address: teacher.address,
//         profilePic: teacher.profilePic,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


export const teacherLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const teacher = await Teacher.findOne({ username })
      .populate("subjects", "name code")
      .populate("classSections.class", "name")
      .populate("classSections.section", "name")
      .populate("createdBy", "name email");

    if (!teacher)
      return res.status(400).json({
        success: false,
        message: "Teacher not found",
      });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch)
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });

    // remove password before sending response
    teacher.password = undefined;

    const token = jwt.sign(
      { id: teacher._id, role: "teacher" },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: `Welcome back ${teacher.name}`,
      token,
      user: teacher,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Teacher updates own profile
export const updateTeacher = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { name, email, phone, address, qualification, experience, emergencyContact } = req.body;
    const file = req.file;

    // Only editable fields
    const updates = { name, email, phone, address, qualification, experience, emergencyContact };

    // Remove undefined fields
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    // Handle profile picture upload
    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri);
      updates.profilePic = cloudResponse.secure_url;
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { $set: updates },
      { new: true, runValidators: true, select: "-password" }
    );

    if (!updatedTeacher) 
      return res.status(404).json({ success: false, message: "Teacher not found" });

    res.status(200).json({ 
      success: true, 
      message: "Profile updated successfully", 
      teacher: updatedTeacher 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to update profile: ${err.message}` 
    });
  }
};



// Get all classes assigned to the logged-in teacher
export const getMyClasses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const teacher = await Teacher.findById(teacherId).populate("classSections.class", "name");
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    res.status(200).json({ success: true, total: teacher.classSections.length, classes: teacher.classSections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const getMyStudents = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const teacher = await Teacher.findById(teacherId).populate({
      path: "classSections.class",
      populate: { path: "students" }
    });

    let students = [];
    teacher.classSections.forEach(cs => {
      students = [...students, ...cs.class.students];
    });

    res.status(200).json({ success: true, total: students.length, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// Get logged-in teacher profile
export const getTeacherProfile = async (req, res) => {
  try {
    const teacherId = req.user.id; // from JWT
    const teacher = await Teacher.findById(teacherId)
      .select("-password")
      .populate("subjects", "name code")
      .populate("classSections.class", "name")
      .populate("classSections.section", "name");

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    // Keep subjects, classSections as arrays — don’t convert to string
    const teacherData = teacher.toObject();

    // If you want to send extra display fields, send separately
    teacherData.classList = teacher.classSections?.map(cs => cs.class?.name).join(", ") || "N/A";
    teacherData.sectionList = teacher.classSections?.map(cs => cs.section?.name).join(", ") || "N/A";

    res.status(200).json({ success: true, teacher: teacherData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// ===============================
// 📘 Fetch assigned class-section with students (for attendance)
// ===============================


export const getTeacherAssignedClassSections = async (req, res) => {
  try {
    const teacherId = req.user.id; // from authMiddleware

    // Fetch teacher along with classSections and classTeacherOf
    const teacher = await Teacher.findById(teacherId)
      .populate("classSections.class", "name")
      .populate("classSections.section", "name")
      .lean();

    if (!teacher)
      return res.status(404).json({ success: false, message: "Teacher not found" });

    const assignedData = await Promise.all(
      teacher.classSections.map(async (cs) => {
        const classData = await Class.findById(cs.class).lean();
        const sectionData = await Section.findById(cs.section)
          .populate("students", "firstName lastName rollNumber gender username")
          .populate("subjects.subjectId", "name code")
          .populate("subjects.teachers", "name")
          .lean();

        if (!classData || !sectionData) return null;

        // Subjects taught by this teacher
        const mySubjects = sectionData.subjects
          ?.filter((s) =>
            s.teachers.some((t) => t._id.toString() === teacherId.toString())
          )
          ?.map((s) => ({
            subjectId: s.subjectId._id,
            name: s.subjectId.name,
            code: s.subjectId.code,
          }));

        // 🔹 Check if teacher is the class teacher
        const isClassTeacher = teacher.classTeacherOf.some(
          (ct) =>
            ct.class.toString() === cs.class.toString() &&
            ct.section.toString() === cs.section.toString()
        );

        return {
  classId: classData._id,
  className: classData.name,
  sectionId: sectionData._id,
  sectionName: sectionData.name,
  totalStudents: sectionData.students.length,
  students: sectionData.students,
  subjects: mySubjects,
  isClassTeacher: teacher.classTeacherOf.some(
    (ct) =>
      ct.class.toString() === classData._id.toString() &&
      ct.section.toString() === sectionData._id.toString()
  ),
};

      })
    );

    res.status(200).json({
      success: true,
      teacher: teacher.name,
      assignedSections: assignedData.filter(Boolean),
    });
  } catch (err) {
    console.error("Error fetching teacher class-section:", err.message);
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Server error" });
  }
};






// 🧠 GET TEACHER'S CLASS & SECTION DETAILS
// export const getTeacherClassDetails = async (req, res) => {
//   try {
//     const teacher = await Teacher.findById(req.user.id)
//       .populate({
//         path: "classTeacherOf.class",
//         select: "name",
//       })
//       .populate({
//         path: "classTeacherOf.section",
//         select: "name",
//       })
//       .populate({
//         path: "subjects",
//         select: "name code",
//       })
//       .lean();

//     if (!teacher)
//       return res.status(404).json({ success: false, message: "Teacher not found" });

//     // 1️⃣ Classes & Sections Assigned
//     const classSections = await Promise.all(
//       (teacher.classSections || []).map(async (cs) => {
//         const classDoc = await Class.findById(cs.class).select("name").lean();
//         const sectionDoc = await Section.findById(cs.section)
//           .select("name students subjects")
//           .populate({
//             path: "students",
//             select: "firstName lastName rollNumber profilePic gender username phone",
//           })
//           .populate({
//             path: "subjects.subjectId",
//             select: "name code",
//           })
//           .lean();

//         return {
//           className: classDoc?.name,
//           sectionName: sectionDoc?.name,
//           totalStudents: sectionDoc?.students?.length || 0,
//           students: sectionDoc?.students || [],
//           subjects: (sectionDoc?.subjects || []).map((sub) => ({
//             _id: sub.subjectId?._id,
//             name: sub.subjectId?.name,
//             code: sub.subjectId?.code,
//             isHandledByMe: sub.teachers?.some(
//               (t) => t.toString() === teacher._id.toString()
//             ),
//           })),
//         };
//       })
//     );

//     // 2️⃣ Check if teacher is class teacher of any section
//     const classTeacherOf = await Promise.all(
//       (teacher.classTeacherOf || []).map(async (ct) => {
//         const classDoc = await Class.findById(ct.class).select("name").lean();
//         const sectionDoc = await Section.findById(ct.section)
//           .select("name students")
//           .populate({
//             path: "students",
//             select: "firstName lastName rollNumber gender username profilePic phone",
//           })
//           .lean();

//         return {
//           className: classDoc?.name,
//           sectionName: sectionDoc?.name,
//           totalStudents: sectionDoc?.students?.length || 0,
//           students: sectionDoc?.students || [],
//         };
//       })
//     );

//     res.status(200).json({
//       success: true,
//       teacher: {
//         name: teacher.name,
//         email: teacher.email,
//         subjects: teacher.subjects,
//         classTeacherOf,
//         classSections,
//       },
//     });
//   } catch (err) {
//     console.error("Error fetching teacher class details:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// };





export const getTeacherClassDetails = async (req, res) => {
  try {
    // 🧑‍🏫 1️⃣ Fetch Teacher Basic Info
    const teacher = await Teacher.findById(req.user.id)
      .select("name email profilePic gender phone subjects classTeacherOf classSections") // include profile details
      .populate({
        path: "subjects",
        select: "name code",
      })
      .lean();

    if (!teacher)
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });

    // 👩‍🏫 2️⃣ Classes & Sections Teacher Teaches
    const classSections = await Promise.all(
      (teacher.classSections || []).map(async (cs) => {
        const classDoc = await Class.findById(cs.class).select("name").lean();
        const sectionDoc = await Section.findById(cs.section)
          .select("name students subjects")
          .populate({
            path: "students",
            select: "firstName lastName rollNumber profilePic gender username phone",
          })
          .populate({
            path: "subjects.subjectId",
            select: "name code",
          })
          .lean();

        return {
          className: classDoc?.name || "N/A",
          sectionName: sectionDoc?.name || "N/A",
          totalStudents: sectionDoc?.students?.length || 0,
          students: sectionDoc?.students || [],
          subjects:
            (sectionDoc?.subjects || []).map((sub) => ({
              _id: sub.subjectId?._id,
              name: sub.subjectId?.name,
              code: sub.subjectId?.code,
              isHandledByMe: sub.teachers?.some(
                (t) => t.toString() === teacher._id.toString()
              ),
            })) || [],
        };
      })
    );

    // 🏫 3️⃣ Classes Teacher Is Class Teacher Of
    const classTeacherOf = await Promise.all(
      (teacher.classTeacherOf || []).map(async (ct) => {
        const classDoc = await Class.findById(ct.class).select("name").lean();
        const sectionDoc = await Section.findById(ct.section)
          .select("name students")
          .populate({
            path: "students",
            select: "firstName lastName rollNumber gender username profilePic phone",
          })
          .lean();

        return {
          className: classDoc?.name || "N/A",
          sectionName: sectionDoc?.name || "N/A",
          totalStudents: sectionDoc?.students?.length || 0,
          students: sectionDoc?.students || [],
        };
      })
    );

    // ✅ 4️⃣ Send Formatted Response
    res.status(200).json({
      success: true,
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        gender: teacher.gender,
        phone: teacher.phone,
        profilePic: teacher.profilePic,
        subjects: teacher.subjects,
        totalClassesHandling: teacher.classSections?.length || 0,
        classTeacherOf,
        classSections,
      },
    });
  } catch (err) {
    console.error("Error fetching teacher class details:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching teacher class details",
      error: err.message,
    });
  }
};

















// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { Teacher } from "../models/teacherModel.js";
// import getDataUri from "../utils/dataUri.js";
// import cloudinary from "../utils/cloudinary.js";
// import { Class } from "../models/classModel.js";
// // import { Subject } from "../models/subjectModel.js";



// // ---------------- ADMIN CONTROLS ----------------

// // Create Teacher (Admin only)
// // export const createTeacher = async (req, res) => {
// //     try {
// //         const { username, name, password, class: className, section, subject } = req.body;
// //         const adminId = req.user.id; // from authMiddleware("admin")

// //         if (!adminId) {
// //             return res.status(401).json({
// //                 success: false,
// //                 message: "Unauthorized"
// //             });
// //         }

// //         const hashedPassword = await bcrypt.hash(password, 10);

// //         const teacher = new Teacher({
// //             username,
// //             name,
// //             password: hashedPassword,
// //             class: className,
// //             section,
// //             subject,
// //             createdBy: adminId,
// //         });

// //         await teacher.save();

// //         res.status(201).json({
// //             success: true,
// //             message: "Teacher created successfully",
// //             teacher
// //         });
// //     } catch (err) {
// //         res.status(500).json({
// //             success: false,
// //             message: `Failed to create teacher: ${err.message}`
// //         });
// //     }
// // };



// // Create Teacher (Admin only)
// // export const createTeacher = async (req, res) => {
// //     try {
// //         const { username, name, password, class: className, section, subject, email, phone,
// //             address, profilePic, employeeId, qualification, experience, gender, dob, emergencyContact,
// //         } = req.body;
// //         const file = req.file;

// //         const adminId = req.user.id; // from authMiddleware("admin")
// //         if (!adminId) {
// //             return res.status(401).json({
// //                 success: false,
// //                 message: "Unauthorized",
// //             });
// //         }

// //         if (!username || !name || !password || !className || !section || !subject) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: "Required fields missing",
// //             });
// //         }

// //         let profilePicUrl = "";

// //         if (file) {
// //             const fileUri = getDataUri(file); // make sure getDataUri is defined
// //             const cloudResponse = await cloudinary.uploader.upload(fileUri);
// //             profilePicUrl = cloudResponse.secure_url;
// //         }
        

// //         // Hash password
// //         const hashedPassword = await bcrypt.hash(password, 10);

// //         // Create teacher
// //         const teacher = new Teacher({
// //             username,
// //             name,
// //             password: hashedPassword,
// //             class: className,
// //             section,
// //             subject,
// //             email: email || "",
// //             phone: phone || "",
// //             address: address || "",
// //             profilePic: profilePicUrl || "",
// //             employeeId: employeeId || "",
// //             qualification: qualification || "",
// //             experience: experience || 0,
// //             gender: gender || "",
// //             dob: dob || null,
// //             emergencyContact: emergencyContact || "",
// //             joiningDate: new Date(),
// //             createdBy: adminId,
// //             status: "active",
// //             isEmailVerified: false,
// //         });

// //         await teacher.save();

// //         res.status(201).json({
// //             success: true,
// //             message: "Teacher created successfully",
// //             teacher,
// //         });
// //     } catch (err) {
// //         res.status(500).json({
// //             success: false,
// //             message: `Failed to create teacher: ${err.message}`,
// //         });
// //     }
// // };


// export const createTeacher = async (req, res) => {
//   try {
//     const {
//       username,
//       name,
//       password,
//       class: classIdOrName,   // could be ObjectId or name like "9th"
//       section,
//       subject: subjectName,   // now just a string like "English"
//       email,
//       phone,
//       address,
//       employeeId,
//       qualification,
//       experience,
//       gender,
//       dob,
//       emergencyContact
//     } = req.body;

//     const adminId = req.user.id;
//     if (!adminId) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     if (!username || !name || !password || !classIdOrName || !section || !subjectName) {
//       return res.status(400).json({ success: false, message: "Required fields missing" });
//     }

//     // 🔒 Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ✅ Resolve Class (by name or _id)
//     let classDoc = await Class.findOne({ name: classIdOrName });
//     if (!classDoc) {
//       classDoc = await Class.findById(classIdOrName);
//     }
//     if (!classDoc) {
//       return res.status(404).json({ success: false, message: "Class not found" });
//     }

//     // ✅ Find the section
//     const sectionDoc = classDoc.sections.find(s => s.name === section);
//     if (!sectionDoc) {
//       return res.status(404).json({ success: false, message: "Section not found" });
//     }

//     // ✅ Find the subject inside the section
//     const subjectEntry = sectionDoc.subjects.find(sub => sub.subject === subjectName);
//     if (!subjectEntry) {
//       return res.status(404).json({ success: false, message: "Subject not found in this section" });
//     }

//     // ✅ Create Teacher
//     const teacher = new Teacher({
//       username,
//       name,
//       password: hashedPassword,
//       class: classDoc._id,
//       section,
//       subject: subjectName, // ✅ save subject as string
//       email: email || "",
//       phone: phone || "",
//       address: address || "",
//       employeeId: employeeId || "",
//       qualification: qualification || "",
//       experience: experience || 0,
//       gender: gender || "",
//       dob: dob || null,
//       emergencyContact: emergencyContact || "",
//       joiningDate: new Date(),
//       createdBy: adminId,
//       status: "active",
//       isEmailVerified: false,
//     });

//     await teacher.save();

//     // 🔗 Push teacher into Class → Section → Subject
//     subjectEntry.teachers.push(teacher._id);
//     await classDoc.save();

//     res.status(201).json({
//       success: true,
//       message: "Teacher created successfully",
//       teacher,
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: `Failed to create teacher: ${err.message}`,
//     });
//   }
// };





// // Get single teacher by ID (Admin only)
// export const getTeacherById = async (req, res) => {
//     try {
//         const teacherId = req.params.id;

//         // const teacher = await Teacher.findById(teacherId).select("-password");

//         const teacher = await Teacher.findById(teacherId)
//             .select("-password")
//             .populate("class", "name")
//             .populate("subject", "name");



//         if (!teacher) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Teacher not found",
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             teacher,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: `Failed to fetch teacher: ${error.message}`,
//         });
//     }
// };



// // Get all teachers by subject
// export const getTeachersBySubject = async (req, res) => {
//     try {
//         const { subjectId } = req.params; // subject ObjectId

//         const teachers = await Teacher.find({ subject: subjectId })
//             .select("-password")
//             .populate("class", "name")
//             .populate("subject", "name");

//         if (teachers.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No teachers found for this subject",
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             total: teachers.length,
//             teachers,
//         });
//     } catch (err) {
//         res.status(500).json({
//             success: false,
//             message: `Failed to fetch teachers: ${err.message}`,
//         });
//     }
// };




// export const getTeachersBySubjectEmbedded = async (req, res) => {
//     try {
//         const { subjectId } = req.params;

//         const classes = await Class.find({ "sections.subjects.subject": subjectId })
//             .select("name sections.name sections.subjects")
//             .populate({
//                 path: "sections.subjects.subject",
//                 select: "name"
//             })
//             .populate({
//                 path: "sections.subjects.teachers",
//                 select: "name email phone"
//             });

//         const result = [];

//         classes.forEach(cls => {
//             cls.sections.forEach(sec => {
//                 sec.subjects.forEach(sub => {
//                     if (sub.subject._id.toString() === subjectId) {
//                         result.push({
//                             class: cls.name,
//                             section: sec.name,
//                             subject: sub.subject.name,
//                             teachers: sub.teachers
//                         });
//                     }
//                 });
//             });
//         });

//         if (result.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No teachers found for this subject",
//             });
//         }

//         res.status(200).json({
//             success: true,
//             result,
//         });

//     } catch (err) {
//         res.status(500).json({ success: false, message: err.message });
//     }
// };



// // Admin update teacher details
// // export const adminUpdateTeacher = async (req, res) => {
// //     try {
// //         const adminId = req.user.id; // from authMiddleware("admin")
// //         const teacherId = req.params.id;
// //         const { name, class: className, section, subject, employeeId, joiningDate, status, email, phone, address,
// //             qualification, profilePic, experience, gender, dob, emergencyContact
// //         } = req.body;
// //         const file = req.file;



// //         // Build update object
// //         const updates = {};
// //         if (name) updates.name = name;
// //         if (className) updates.class = className;
// //         if (section) updates.section = section;
// //         if (subject) updates.subject = subject;
// //         if (employeeId) updates.employeeId = employeeId;
// //         if (joiningDate) updates.joiningDate = joiningDate;
// //         if (status) updates.status = status;

// //         // Optional personal info
// //         if (email) updates.email = email;
// //         if (phone) updates.phone = phone;
// //         if (address) updates.address = address;
// //         if (qualification) updates.qualification = qualification;
// //         if (experience) updates.experience = experience;
// //         if (gender) updates.gender = gender;
// //         if (dob) updates.dob = dob;
// //         if (emergencyContact) updates.emergencyContact = emergencyContact;

// //         if (file) {
// //             const fileUri = getDataUri(file);
// //             const cloudResponse = await cloudinary.uploader.upload(fileUri);
// //             updates.profilePic = cloudResponse.secure_url;
// //         }

// //         const updatedTeacher = await Teacher.findByIdAndUpdate(
// //             teacherId,
// //             { $set: updates },
// //             { new: true, runValidators: true, select: "-password" }
// //         );

// //         if (!updatedTeacher) {
// //             return res.status(404).json({
// //                 success: false,
// //                 message: "Teacher not found"
// //             });
// //         }

// //         return res.status(200).json({
// //             success: true,
// //             message: "Teacher details updated successfully",
// //             teacher: updatedTeacher,
// //         });
// //     } catch (error) {
// //         res.status(500).json({
// //             success: false,
// //             message: `Failed to update teacher: ${error.message}`
// //         });
// //     }
// // };


// export const adminUpdateTeacher = async (req, res) => {
//     try {
//         const adminId = req.user.id;
//         const teacherId = req.params.id;
//         const { name, class: newClass, section: newSection, subject: newSubject, 
//                 employeeId, joiningDate, status, email, phone, address,
//                 qualification, experience, gender, dob, emergencyContact
//         } = req.body;

//         const teacher = await Teacher.findById(teacherId);
//         if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

//         const oldClass = teacher.class;
//         const oldSection = teacher.section;
//         const oldSubject = teacher.subject;

//         // Build update object
//         const updates = {};
//         if (name) updates.name = name;
//         if (newClass) updates.class = newClass;
//         if (newSection) updates.section = newSection;
//         if (newSubject) updates.subject = newSubject;
//         if (employeeId) updates.employeeId = employeeId;
//         if (joiningDate) updates.joiningDate = joiningDate;
//         if (status) updates.status = status;
//         if (email) updates.email = email;
//         if (phone) updates.phone = phone;
//         if (address) updates.address = address;
//         if (qualification) updates.qualification = qualification;
//         if (experience) updates.experience = experience;
//         if (gender) updates.gender = gender;
//         if (dob) updates.dob = dob;
//         if (emergencyContact) updates.emergencyContact = emergencyContact;

//         // Update teacher
//         const updatedTeacher = await Teacher.findByIdAndUpdate(teacherId, { $set: updates }, { new: true, runValidators: true, select: "-password" });

//         // ---------------- Update Class → Section → Subject ----------------
//         // Remove from old class-section-subject if changed
//         if (oldClass.toString() !== newClass || oldSection !== newSection || oldSubject.toString() !== newSubject) {
//             await Class.updateOne(
//                 { _id: oldClass, "sections.name": oldSection },
//                 { $pull: { "sections.$.subjects.$[sub].teachers": teacher._id } },
//                 { arrayFilters: [{ "sub.subject": oldSubject }] }
//             );

//             await Class.updateOne(
//                 { _id: newClass, "sections.name": newSection },
//                 { $addToSet: { "sections.$.subjects.$[sub].teachers": teacher._id } },
//                 { arrayFilters: [{ "sub.subject": newSubject }] }
//             );
//         }

//         res.status(200).json({ success: true, message: "Teacher details updated successfully", teacher: updatedTeacher });

//     } catch (err) {
//         res.status(500).json({ success: false, message: `Failed to update teacher: ${err.message}` });
//     }
// };



// // Get all teachers (Admin only)
// export const getTeachers = async (req, res) => {
//     try {
//         // const teachers = await Teacher.find().select("-password");

//         const teachers = await Teacher.find().select("-password")
//             .populate("class", "name")
//             .populate("subject", "name");



//         res.status(200).json({
//             success: true,
//             TotalTeacher: teachers.length,
//             teachers
//         });
//     } catch (err) {
//         res.status(500).json({ success: false, message: err.message });
//     }
// };

// // Delete teacher (Admin only)
// // export const deleteTeacher = async (req, res) => {
// //     try {
// //         const { id } = req.params;
// //         await Teacher.findByIdAndDelete(id);
// //         res.status(200).json({
// //             success: true,
// //             message: "Teacher deleted successfully"
// //         });
// //     } catch (err) {
// //         res.status(500).json({
// //             success: false,
// //             message: `Failed to delete teacher: ${err.message}`
// //         });
// //     }
// // };




// export const deleteTeacher = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const teacher = await Teacher.findById(id);
//         if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

//         // Remove teacher from Class → Sections → Subjects
//         await Class.updateOne(
//             { _id: teacher.class, "sections.name": teacher.section },
//             { $pull: { "sections.$.subjects.$[sub].teachers": teacher._id } },
//             { arrayFilters: [{ "sub.subject": teacher.subject }] }
//         );

//         await Teacher.findByIdAndDelete(id);

//         res.status(200).json({ success: true, message: "Teacher deleted successfully" });

//     } catch (err) {
//         res.status(500).json({ success: false, message: `Failed to delete teacher: ${err.message}` });
//     }
// };



// // ---------------- TEACHER SELF CONTROLS ----------------

// // Teacher login
// export const teacherLogin = async (req, res) => {
//     try {
//         const { username, password } = req.body;

//         const teacher = await Teacher.findOne({ username });
//         if (!teacher)
//             return res.status(400).json({
//                 success: false,
//                 message: "Teacher not found"
//             });

//         const isMatch = await bcrypt.compare(password, teacher.password);
//         if (!isMatch)
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid credentials"
//             });

//         const token = jwt.sign(
//             { id: teacher._id, role: "teacher" },
//             process.env.SECRET_KEY,
//             { expiresIn: "1d" }
//         );

//         return res.status(200).json({
//             success: true,
//             message: `Welcome back ${teacher.name}`,
//             token,
//             teacher: {
//                 id: teacher._id,
//                 username: teacher.username,
//                 name: teacher.name,
//                 class: teacher.class,
//                 section: teacher.section,
//                 subject: teacher.subject,
//                 email: teacher.email,
//                 phone: teacher.phone,
//                 address: teacher.address,
//                 profilePic: teacher.profilePic,
//             },
//         });
//     } catch (err) {
//         res.status(500).json({ success: false, message: err.message });
//     }
// };

// // Teacher update own profile
// // export const updateTeacher = async (req, res) => {
// //     try {
// //         const teacherId = req.user.id; // from authMiddleware("teacher")
// //         const { email, phone, address } = req.body;
// //         const file = req.file;

// //         const updates = {};
// //         if (email) updates.email = email;
// //         if (phone) updates.phone = phone;
// //         if (address) updates.address = address;

// //         if (file) {
// //             const fileUri = getDataUri(file);
// //             const cloudResponse = await cloudinary.uploader.upload(fileUri);
// //             updates.profilePic = cloudResponse.secure_url;
// //         }

// //         const updatedTeacher = await Teacher.findByIdAndUpdate(
// //             teacherId,
// //             { $set: updates },
// //             { new: true, runValidators: true, select: "-password" }
// //         );

// //         if (!updatedTeacher) {
// //             return res.status(404).json({
// //                 success: false,
// //                 message: "Teacher not found"
// //             });
// //         }

// //         return res.status(200).json({
// //             success: true,
// //             message: "Profile updated successfully",
// //             teacher: updatedTeacher,
// //         });
// //     } catch (error) {
// //         res.status(500).json({
// //             success: false,
// //             message: `Failed to update profile: ${error.message}`
// //         });
// //     }
// // };


// // Teacher update own profile
// export const updateTeacher = async (req, res) => {
//     try {
//         const teacherId = req.user.id; // from authMiddleware("teacher")
//         const { email, phone, address, qualification, profilePic, experience, gender, dob, emergencyContact } = req.body;
//         const file = req.file;

//         const updates = {};

//         if (email) updates.email = email;
//         if (phone) updates.phone = phone;
//         if (address) updates.address = address;
//         if (qualification) updates.qualification = qualification;
//         if (experience) updates.experience = experience;
//         if (gender) updates.gender = gender;
//         if (dob) updates.dob = dob;
//         if (emergencyContact) updates.emergencyContact = emergencyContact;

//         if (file) {
//             const fileUri = getDataUri(file);
//             const cloudResponse = await cloudinary.uploader.upload(fileUri);
//             updates.profilePic = cloudResponse.secure_url;
//         }

//         const updatedTeacher = await Teacher.findByIdAndUpdate(
//             teacherId,
//             { $set: updates },
//             { new: true, runValidators: true, select: "-password" }
//         );

//         if (!updatedTeacher) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Teacher not found"
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Profile updated successfully",
//             teacher: updatedTeacher,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: `Failed to update profile: ${error.message}`
//         });
//     }
// };




