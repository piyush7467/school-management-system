import bcrypt from "bcryptjs";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";
import jwt from "jsonwebtoken";

import { Student } from "../models/studentModel.js";
import { Teacher } from "../models/teacherModel.js";
import { Subject } from "../models/subjectModel.js";
import mongoose from "mongoose";
import { Section } from "../models/SectionModel.js";
/**
 * ---------------------
 * Admin: Create Student
 * ---------------------
 */
export const createStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      class: studentClass,
      rollNumber,
      gender,
      address,
      dateOfBirth,
      phone,
      status,
    } = req.body;

    let { parentInfo } = req.body;
    if (typeof parentInfo === "string") {
      try {
        parentInfo = JSON.parse(parentInfo);
      } catch {
        return res.status(400).json({ message: "Invalid parentInfo format" });
      }
    }

    const file = req.file;
    const adminId = req.user.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    // Required fields
    if (!firstName || !lastName || !username || !password || !studentClass) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Validate class ID
    if (!mongoose.Types.ObjectId.isValid(studentClass)) {
      return res.status(400).json({ message: "Invalid class ID" });
    }

    // Check uniqueness
    const existingUser = await Student.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload image
    let profilePicUrl = "";
    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri);
      profilePicUrl = cloudResponse.secure_url;
    }

    const newStudent = new Student({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      classId: new mongoose.Types.ObjectId(studentClass),
      sectionId: null, // Section left empty, admin will provide later if needed
      rollNumber,
      gender,
      address,
      dateOfBirth,
      phone,
      status: status || "active",
      profilePic: profilePicUrl,
      parentInfo: parentInfo || { father: {}, mother: {} },
      createdBy: new mongoose.Types.ObjectId(adminId),
    });

    await newStudent.save();

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student: newStudent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



/**
 * ---------------------
 * Admin: Update Student
 * ---------------------
 */


export const adminUpdateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const file = req.file;

    let {
      firstName,
      lastName,
      username,
      email,
      password,
      classId,      // changed from "class"
      sectionId,    // changed from "section"
      rollNumber,
      gender,
      address,
      dateOfBirth,
      phone,
      status,
      parentInfo,
    } = req.body;

    // Find student
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Parent info parsing
    if (parentInfo) {
      if (typeof parentInfo === "string") {
        try {
          parentInfo = JSON.parse(parentInfo);
        } catch {
          return res.status(400).json({ message: "Invalid parentInfo format" });
        }
      }
      student.parentInfo = {
        father: { ...student.parentInfo?.father, ...parentInfo.father },
        mother: { ...student.parentInfo?.mother, ...parentInfo.mother },
      };
    }

    // Update basic fields
    if (firstName !== undefined) student.firstName = firstName;
    if (lastName !== undefined) student.lastName = lastName;
    if (username !== undefined) student.username = username;
    if (email !== undefined) student.email = email;
    if (rollNumber !== undefined) student.rollNumber = rollNumber;
    if (gender !== undefined) student.gender = gender;
    if (address !== undefined) student.address = address;
    if (dateOfBirth !== undefined) student.dateOfBirth = dateOfBirth;
    if (phone !== undefined) student.phone = phone;
    if (status !== undefined) student.status = status;

    // Password update
    if (password) {
      student.password = await bcrypt.hash(password, 10);
    }

    // Update classId if provided
    if (classId) {
      if (!mongoose.Types.ObjectId.isValid(classId))
        return res.status(400).json({ message: "Invalid class ID" });
      student.classId = new mongoose.Types.ObjectId(classId);
    }

    // Update sectionId if provided
    if (sectionId) {
      if (!mongoose.Types.ObjectId.isValid(sectionId))
        return res.status(400).json({ message: "Invalid section ID" });
      student.sectionId = new mongoose.Types.ObjectId(sectionId);
    }

    // Update profile picture if uploaded
    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri);
      student.profilePic = cloudResponse.secure_url;
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



/**
 * ----------------------
 * Student: Update Profile
 * ----------------------
 */
// export const studentUpdateProfile = async (req, res) => {
//   try {
//     const studentId = req.user.id;
//     const file = req.file;

//     const { firstName, lastName, username, email, password, gender, dateOfBirth, phone, parentInfo } = req.body;

//     const updates = {};
//     if (firstName) updates.firstName = firstName;
//     if (lastName) updates.lastName = lastName;
//     if (username) updates.username = username;
//     if (email) updates.email = email;
//     if (gender) updates.gender = gender;
//     if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
//     if (phone) updates.phone = phone;
//     if (password) updates.password = await bcrypt.hash(password, 10);

//     if (file) {
//       const fileUri = getDataUri(file);
//       const cloudResponse = await cloudinary.uploader.upload(fileUri);
//       updates.profilePic = cloudResponse.secure_url;
//     }

//     const student = await Student.findById(studentId);
//     if (!student) return res.status(404).json({ message: "Student not found" });

//     if (parentInfo) {
//       if (typeof parentInfo === "string") student.parentInfo = JSON.parse(parentInfo);
//       else student.parentInfo = { ...student.parentInfo.toObject(), ...parentInfo };
//     }

//     Object.assign(student, updates);
//     await student.save();

//     res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       student,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: `Failed to update profile: ${error.message}` });
//   }
// };

/**
 * ----------------
 * Get Student(s)
 * ----------------
 */
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .select("-password")
      .populate("classId", "name")
      .populate("sectionId", "name");

    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ message: `Failed to fetch student: ${error.message}` });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select("-password")
      .populate("classId", "name")      // <- match schema field name
      .populate("sectionId", "name");   // <- match schema field name

    res.json({ success: true, total: students.length, students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Fetch students for a given class, optionally filtered by section
export const getStudentsByClass = async (req, res) => {
  try {
    const { classId, sectionId } = req.params;

    // Validate classId
    if (!mongoose.Types.ObjectId.isValid(classId))
      return res.status(400).json({ message: "Invalid class ID" });

    const filter = { classId }; // field name in schema: classId
    if (sectionId) {
      if (!mongoose.Types.ObjectId.isValid(sectionId))
        return res.status(400).json({ message: "Invalid section ID" });
      filter.sectionId = sectionId; // field name in schema: sectionId
    }

    const students = await Student.find(filter)
      .select("-password") // exclude password
      .populate("classId", "name") // get class name
      .populate("sectionId", "name"); // get section name

    res.status(200).json({
      success: true,
      total: students.length,
      students,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




// Get students by class and section (for attendance)
export const getStudentsByClassSection = async (req, res) => {
  try {
    const { classId, sectionId } = req.params;

    if (!classId || !sectionId) {
      return res.status(400).json({ success: false, message: "Class ID and Section ID are required" });
    }

    const students = await Student.find({
      classId: classId,
      sectionId: sectionId
    }).select("-password"); // exclude password

    res.status(200).json({
      success: true,
      total: students.length,
      students
    });
  } catch (err) {
    console.error("Error fetching students by class-section:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




// Controller to get students by class only
export const getStudentsByClassOnly = async (req, res) => {
  try {
    const { classId } = req.params;

    // Validate classId
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid class ID" });
    }

    const students = await Student.find({ classId })
      .select("-password") // exclude password
      .populate("classId", "name"); // get class name

    res.status(200).json({
      success: true,
      total: students.length,
      students,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * ----------------
 * Delete Student
 * ----------------
 */
export const deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ----------------
 * Student Login
 * ----------------
 */

export const studentLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1️⃣ Find student and populate class + section
    const student = await Student.findOne({ username })
      .populate("classId", "name")
      .populate("sectionId", "name");

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Student not found",
      });
    }

    // 2️⃣ Check password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3️⃣ Generate JWT token
    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    // 4️⃣ Send all student data (clean & structured)
    res.status(200).json({
      success: true,
      message: `Welcome back, ${student.firstName} ${student.lastName}`,
      token,
      user: {
        id: student._id,
        username: student.username,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        gender: student.gender,
        address: student.address,
        rollNumber: student.rollNumber,
        dateOfBirth: student.dateOfBirth,
        status: student.status,
        profilePic: student.profilePic,
        class: student.classId ? { id: student.classId._id, name: student.classId.name } : null,
        section: student.sectionId ? { id: student.sectionId._id, name: student.sectionId.name } : null,
        parentInfo: {
          father: student.parentInfo?.father || {},
          mother: student.parentInfo?.mother || {},
        },
        isEmailVerified: student.isEmailVerified,
        createdAt: student.createdAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: `Login failed: ${err.message}`,
    });
  }
};




export const studentUpdateProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const file = req.file;

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      parentInfo
    } = req.body;

    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;

    // Handle profile picture upload
    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri);
      updates.profilePic = cloudResponse.secure_url;
    }

    // Find student
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    // Merge parent info if provided
    if (parentInfo) {
      if (typeof parentInfo === "string") {
        student.parentInfo = JSON.parse(parentInfo);
      } else {
        student.parentInfo = { ...student.parentInfo.toObject(), ...parentInfo };
      }
    }

    // Apply updates
    Object.assign(student, updates);
    await student.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      student
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: `Failed to update profile: ${error.message}` });
  }
};


export const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.id; // from JWT
    const student = await Student.findById(studentId)
      .select("-password")
      .populate("classId", "name")
      .populate("sectionId", "name");

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Convert to plain object for any extra processing
    const studentData = student.toObject();

    // Optional: create extra display fields
    studentData.className = student.classId?.name || "N/A";
    studentData.sectionName = student.sectionId?.name || "N/A";

    res.status(200).json({ success: true, student: studentData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getMyClasses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await Student.findById(studentId)
      .populate("classId", "name")
      .populate("sectionId", "name");

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const classes = [];

    if (student.classId) {
      classes.push({
        classId: student.classId._id,
        className: student.classId.name,
        sectionId: student.sectionId?._id || null,
        sectionName: student.sectionId?.name || null,
      });
    }

    res.status(200).json({ success: true, total: classes.length, classes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch classes", error: err.message });
  }
};






// GET /api/student/my-class-details
// export const getMyClassDetails = async (req, res) => {
//   try {
//     const studentId = req.user.id;

//     // Fetch student with class & section populated
//     const student = await Student.findById(studentId)
//       .populate("classId", "name")
//       .populate("sectionId", "name")
//       .lean();

//     if (!student) {
//       return res.status(404).json({ success: false, message: "Student not found" });
//     }

//     const classData = student.classId;
//     const sectionData = student.sectionId;

//     if (!classData) {
//       return res.status(400).json({ success: false, message: "Class not assigned to student" });
//     }

//     // Fetch class teacher for this class-section
//     const classTeacher = await Teacher.findOne({
//       "classTeacherOf.class": classData._id,
//       "classTeacherOf.section": sectionData?._id,
//     }).select("name email phone profilePic").lean();

//     // Fetch subjects for this class-section
//     const subjects = await Subject.find({ classId: classData._id, sectionId: sectionData?._id })
//       .populate("teacherId", "name email") // populate subject teacher
//       .lean();

//     const formattedSubjects = subjects.map(s => ({
//       subjectId: s._id,
//       name: s.name,
//       code: s.code,
//       teacher: s.teacherId
//         ? { teacherId: s.teacherId._id, name: s.teacherId.name, email: s.teacherId.email }
//         : null,
//     }));

//     res.status(200).json({
//       success: true,
//       class: {
//         classId: classData._id,
//         className: classData.name,
//         sectionId: sectionData?._id || null,
//         sectionName: sectionData?.name || null,
//         classTeacher: classTeacher || null,
//         subjects: formattedSubjects,
//       },
//     });
//   } catch (err) {
//     console.error("Error fetching student class details:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch class details",
//       error: err.message,
//     });
//   }
// };


export const getMyClassDetails = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate({
        path: "classId",
        select: "name",
      })
      .populate({
        path: "sectionId",
        select: "name subjects",
      })
      .lean();

    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const classData = student.classId;
    const sectionData = student.sectionId;

    if (!classData || !sectionData) {
      return res.status(400).json({ success: false, message: "Class or section not assigned" });
    }

    // 1️⃣ Class Teacher for this class-section
    const classTeacher = await Teacher.findOne({
      "classTeacherOf.class": classData._id,
      "classTeacherOf.section": sectionData._id,
    }).select("name email phone profilePic").lean();

    // 2️⃣ Subjects with their teachers
    const subjects = await Promise.all(
      (sectionData.subjects || []).map(async (sub) => {
        const subjectDoc = await Subject.findById(sub.subjectId).select("name code").lean();

        // Get all teachers assigned to this subject in this section
        const teachers = await Teacher.find({
          subjects: sub.subjectId,
          "classSections.section": sectionData._id,
        }).select("name email phone profilePic ").lean();

        return {
          _id: subjectDoc._id,
          name: subjectDoc.name,
          code: subjectDoc.code,
          teacher: teachers.length > 0 ? teachers[0] : null, // optional: first teacher
          allTeachers: teachers.map(t => ({ name: t.name, email: t.email })), // if you want all teachers
        };
      })
    );

    res.status(200).json({
      success: true,
      class: {
        className: classData.name,
        sectionName: sectionData.name,
        classTeacher: classTeacher || null,
        subjects,
      },
    });
  } catch (err) {
    console.error("Error fetching class details:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


























// import bcrypt from "bcryptjs";
// import cloudinary from "../utils/cloudinary.js";
// import getDataUri from "../utils/dataUri.js";
// import jwt from 'jsonwebtoken'
// import mongoose from "mongoose";
// import { Student } from "../models/studentModel.js";





// // export const createStudent = async (req, res) => {
// //   try {
// //     const { username, name, password, class: className, section, rollNo } = req.body;

// //     // Make sure admin ID comes from auth middleware
// //     const adminId = req.user.id;
// //     if (!adminId) {
// //       return res.status(401).json({ success: false, message: "Unauthorized" });
// //     }

// //     const hashedPassword = await bcrypt.hash(password, 10);

// //     const student = new Student({
// //       username,
// //       name,
// //       password: hashedPassword,
// //       class: className,
// //       section,
// //       rollNo,
// //       createdBy: adminId, // set the admin ID here
// //     });

// //     await student.save();

// //     res.status(201).json({ success: true, student });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };








// // Get all students



// // export const createStudent = async (req, res) => {
// //   try {
// //     const {  firstName, lastName, username, email, password, class: studentClass,
// //       section, rollNumber, gender,address,  dateOfBirth, phone, status,  } = req.body;

// //     let { parentInfo } = req.body; // may come as string

// //     // Parse parentInfo if it's a string
// //     if (typeof parentInfo === "string") {
// //       try {
// //         parentInfo = JSON.parse(parentInfo);
// //       } catch (err) {
// //         return res.status(400).json({ message: "Invalid parentInfo format" });
// //       }
// //     }

// //     const file = req.file;
// //     const adminId = req.user.id; // from authMiddleware("admin")
// //     if (!adminId) {
// //       return res.status(401).json({ success: false, message: "Unauthorized" });
// //     }

// //     // Required fields validation
// //     if (!firstName || !lastName || !username || !password || !studentClass || !section) {
// //       return res.status(400).json({ message: "Required fields missing" });
// //     }

// //     // Check uniqueness
// //     const existingUser = await Student.findOne({username});
// //     if (existingUser) {
// //       return res.status(400).json({ message: "Username or email already exists" });
// //     }

// //     // Hash password
// //     const hashedPassword = await bcrypt.hash(password, 10);

// //     // Handle profile picture
// //     let profilePicUrl = "";
// //     if (file) {
// //       const fileUri = getDataUri(file);
// //       const cloudResponse = await cloudinary.uploader.upload(fileUri);
// //       profilePicUrl = cloudResponse.secure_url;
// //     }

// //     const newStudent = new Student({
// //       firstName,
// //       lastName,
// //       username,
// //       email,
// //       password: hashedPassword,
// //       class: studentClass,
// //       section,
// //       rollNumber,
// //       gender,
// //       address,
// //       dateOfBirth,
// //       phone,
// //       status: status || "active",
// //       profilePic: profilePicUrl,
// //       parentInfo: parentInfo || {
// //         father: { name: "", email: "", phone: "" },
// //         mother: { name: "", email: "", phone: "" },
// //       },
// //       createdBy: adminId,
// //     });

// //     await newStudent.save();

// //     res.status(201).json({
// //       success: true,
// //       message: "Student created successfully",
// //       student: newStudent,
// //     });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ success: false, message: "Server error" });
// //   }
// // };



// export const createStudent = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       username,
//       email,
//       password,
//       class: studentClass,
//       section,
//       rollNumber,
//       gender,
//       address,
//       dateOfBirth,
//       phone,
//       status,
//     } = req.body;

//     let { parentInfo } = req.body;

//     // Parse parentInfo if sent as string
//     if (typeof parentInfo === "string") {
//       try {
//         parentInfo = JSON.parse(parentInfo);
//       } catch {
//         return res.status(400).json({ message: "Invalid parentInfo format" });
//       }
//     }

//     const file = req.file;
//     const adminId = req.user.id;
//     if (!adminId) return res.status(401).json({ message: "Unauthorized" });

//     // Validate required fields
//     if (!firstName || !lastName || !username || !password || !studentClass || !section) {
//       return res.status(400).json({ message: "Required fields missing" });
//     }

//     // Validate class ObjectId
//     if (!mongoose.Types.ObjectId.isValid(studentClass)) {
//       return res.status(400).json({ message: "Invalid class ID" });
//     }

//     // Handle section(s)
//     let sectionId;
//     if (Array.isArray(section)) {
//       sectionId = section.map(sec => {
//         if (!mongoose.Types.ObjectId.isValid(sec)) {
//           throw new Error(`Invalid section ID: ${sec}`);
//         }
//         return new mongoose.Types.ObjectId(sec); // use 'new'
//       });
//     } else {
//       if (!mongoose.Types.ObjectId.isValid(section)) {
//         return res.status(400).json({ message: "Invalid section ID" });
//       }
//       sectionId = new mongoose.Types.ObjectId(section); // use 'new'
//     }

//     // Check username uniqueness
//     const existingUser = await Student.findOne({ username });
//     if (existingUser) return res.status(400).json({ message: "Username already exists" });

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Handle profile picture upload
//     let profilePicUrl = "";
//     if (file) {
//       const fileUri = getDataUri(file);
//       const cloudResponse = await cloudinary.uploader.upload(fileUri);
//       profilePicUrl = cloudResponse.secure_url;
//     }

//     // Create student document
//     const newStudent = new Student({
//       firstName,
//       lastName,
//       username,
//       email,
//       password: hashedPassword,
//       class: new mongoose.Types.ObjectId(studentClass),
//       section: sectionId,
//       rollNumber,
//       gender,
//       address,
//       dateOfBirth,
//       phone,
//       status: status || "active",
//       profilePic: profilePicUrl,
//       parentInfo: parentInfo || {
//         father: { name: "", email: "", phone: "" },
//         mother: { name: "", email: "", phone: "" },
//       },
//       createdBy: new mongoose.Types.ObjectId(adminId),
//     });

//     await newStudent.save();

//     res.status(201).json({
//       success: true,
//       message: "Student created successfully",
//       student: newStudent,
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };






// // export const getStudentById = async (req, res) => {
// //   try {
// //     const studentId = req.params.id;
// //     const student = await Student.findById(studentId).select("-password");
// //     if (!student) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Student not found",
// //       });
// //     }

// //     return res.status(200).json({
// //       success: true,
// //       student,
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: `Failed to fetch student: ${error.message}`,
// //     });
// //   }
// // };



// // export const createStudent = async (req, res) => {
// //   try {
// //     const { firstName, lastName, username, email, password, class: studentClass, section, rollNumber, gender, address, dateOfBirth, phone, status } = req.body;
// //     let { parentInfo } = req.body;

// //     if (typeof parentInfo === "string") parentInfo = JSON.parse(parentInfo);

// //     const adminId = req.user.id;
// //     if (!adminId) return res.status(401).json({ message: "Unauthorized" });

// //     if (!firstName || !lastName || !username || !password || !studentClass || !section) {
// //       return res.status(400).json({ message: "Required fields missing" });
// //     }

// //     // Validate ObjectIds
// //     if (!mongoose.Types.ObjectId.isValid(studentClass) || !mongoose.Types.ObjectId.isValid(section)) {
// //       return res.status(400).json({ message: "Invalid class or section ID" });
// //     }

// //     // Check username uniqueness
// //     const existingUser = await Student.findOne({ username });
// //     if (existingUser) return res.status(400).json({ message: "Username already exists" });

// //     const hashedPassword = await bcrypt.hash(password, 10);

// //     const newStudent = new Student({
// //       firstName,
// //       lastName,
// //       username,
// //       email,
// //       password: hashedPassword,
// //       class: studentClass,
// //       section,
// //       rollNumber,
// //       gender,
// //       address,
// //       dateOfBirth,
// //       phone,
// //       status: status || "active",
// //       parentInfo: parentInfo || { father: {}, mother: {} },
// //       createdBy: adminId,
// //     });

// //     await newStudent.save();

// //     res.status(201).json({ success: true, message: "Student created successfully", student: newStudent });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ success: false, message: "Server error", error: err.message });
// //   }
// // };


// export const getStudentById = async (req, res) => {
//   try {
//     const studentId = req.params.id;

//     const student = await Student.findById(studentId)
//       .select("-password")
//       .populate("class", "name")   // get class name only
//       .populate("section", "name"); // get section name only

//     if (!student) {
//       return res.status(404).json({
//         success: false,
//         message: "Student not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       student,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: `Failed to fetch student: ${error.message}`,
//     });
//   }
// };




// export const getStudents = async (req, res) => {
//   try {
//     const students = await Student.find()
//       .populate("class") // only populate Class
//       .lean();

//     const formattedStudents = students.map(student => ({
//       ...student,
//       className: student.class?.name || "N/A",
//       sectionName: student.sectionName || "-", // section as string
//     }));

//     res.json({ students: formattedStudents });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };










// // Get all students of a class (optional: by section)
// export const getStudentsByClass = async (req, res) => {
//   try {
//     const { classId, sectionId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(classId)) return res.status(400).json({ message: "Invalid class ID" });

//     const filter = { class: classId };
//     if (sectionId) {
//       if (!mongoose.Types.ObjectId.isValid(sectionId)) return res.status(400).json({ message: "Invalid section ID" });
//       filter.section = sectionId;
//     }

//     const students = await Student.find(filter)
//       .select("-password")
//       .populate("class", "name")
//       .populate("section", "name");

//     res.status(200).json({
//       success: true,
//       totalStudents: students.length,
//       students,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };





// // ---------------------
// // Update Student (Admin)
// // ---------------------


// // export const adminUpdateStudent = async (req, res) => {
// //   try {
// //     const adminId = req.user.id; // from authMiddleware("admin")
// //     const studentId = req.params.id;
// //     const file = req.file;



// //     const { firstName, lastName, username, email, password,
// //       class: studentClass, section, rollNumber, gender,
// //       dateOfBirth, phone, status, parentInfo, } = req.body;

// //     // Build update object
// //     const updates = {};
// //     if (firstName) updates.firstName = firstName;
// //     if (lastName) updates.lastName = lastName;
// //     if (username) updates.username = username;
// //     if (email) updates.email = email;
// //     if (studentClass) updates.class = studentClass;
// //     if (section) updates.section = section;
// //     if (rollNumber) updates.rollNumber = rollNumber;
// //     if (gender) updates.gender = gender;
// //     if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
// //     if (phone) updates.phone = phone;
// //     if (status) updates.status = status;

// //     // Password hashing
// //     if (password) {
// //       updates.password = await bcrypt.hash(password, 10);
// //     }

// //     // Profile picture upload
// //     if (file) {
// //       const fileUri = getDataUri(file);
// //       const cloudResponse = await cloudinary.uploader.upload(fileUri);
// //       updates.profilePic = cloudResponse.secure_url;
// //     }

// //     // Update nested parent info
// //     const student = await Student.findById(studentId);
// //     if (!student) {
// //       return res.status(404).json({ success: false, message: "Student not found" });
// //     }

// //     if (parentInfo) {
// //       student.parentInfo = {
// //         ...student.parentInfo.toObject(),
// //         ...parentInfo,
// //       };
// //     }

// //     Object.assign(student, updates);
// //     await student.save();

// //     return res.status(200).json({
// //       success: true,
// //       message: "Student details updated successfully",
// //       student,
// //     });
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({
// //       success: false,
// //       message: `Failed to update student: ${error.message}`,
// //     });
// //   }
// // };



// // export const adminUpdateStudent = async (req, res) => {
// //   try {
// //     const adminId = req.user.id; // from authMiddleware("admin")
// //     const studentId = req.params.id;
// //     const file = req.file;

// //     let {
// //       firstName,
// //       lastName,
// //       username,
// //       email,
// //       password,
// //       class: studentClass,
// //       section,
// //       rollNumber,
// //       gender,
// //       address,
// //       dateOfBirth,
// //       phone,
// //       status,
// //       parentInfo,
// //     } = req.body;

// //     // Convert single-value arrays to string (common from frontend)
// //     const normalizeField = (field) => {
// //       if (Array.isArray(field)) return field[0];
// //       return field;
// //     };

// //     firstName = normalizeField(firstName);
// //     lastName = normalizeField(lastName);
// //     username = normalizeField(username);
// //     email = normalizeField(email);
// //     studentClass = normalizeField(studentClass);
// //     section = normalizeField(section);
// //     rollNumber = normalizeField(rollNumber);
// //     gender = normalizeField(gender);
// //     dateOfBirth = normalizeField(dateOfBirth);
// //     phone = normalizeField(phone);
// //     status = normalizeField(status);

// //     // Build update object
// //     const updates = {};
// //     if (firstName) updates.firstName = firstName;
// //     if (lastName) updates.lastName = lastName;
// //     if (username) updates.username = username;
// //     if (email) updates.email = email;
// //     if (studentClass) updates.class = studentClass;
// //     if (section) updates.section = section;
// //     if (rollNumber) updates.rollNumber = rollNumber;
// //     if (gender) updates.gender = gender;
// //     if (address) updates.address = address;
// //     if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
// //     if (phone) updates.phone = phone;
// //     if (status) updates.status = status;

// //     // Password hashing
// //     if (password) {
// //       updates.password = await bcrypt.hash(password, 10);
// //     }

// //     // Profile picture upload
// //     if (file) {
// //       const fileUri = getDataUri(file);
// //       const cloudResponse = await cloudinary.uploader.upload(fileUri);
// //       updates.profilePic = cloudResponse.secure_url;
// //     }

// //     // Find the student
// //     const student = await Student.findById(studentId);
// //     if (!student) {
// //       return res.status(404).json({ success: false, message: "Student not found" });
// //     }

// //     // Handle parentInfo
// //     if (parentInfo) {
// //       if (typeof parentInfo === "string") {
// //         parentInfo = JSON.parse(parentInfo);
// //       }

// //       student.parentInfo = {
// //         father: {
// //           ...student.parentInfo?.father,
// //           ...parentInfo.father,
// //         },
// //         mother: {
// //           ...student.parentInfo?.mother,
// //           ...parentInfo.mother,
// //         },
// //       };
// //     }

// //     // Update other fields
// //     Object.assign(student, updates);
// //     await student.save();

// //     return res.status(200).json({
// //       success: true,
// //       message: "Student details updated successfully",
// //       student,
// //     });
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({
// //       success: false,
// //       message: `Failed to update student: ${error.message}`,
// //     });
// //   }
// // };


// export const adminUpdateStudent = async (req, res) => {
//   try {
//     const adminId = req.user.id;
//     const studentId = req.params.id;
//     const file = req.file;

//     let {
//       firstName,
//       lastName,
//       username,
//       email,
//       password,
//       class: studentClass,
//       section,
//       rollNumber,
//       gender,
//       address,
//       dateOfBirth,
//       phone,
//       status,
//       parentInfo,
//     } = req.body;

//     // Convert single-value arrays to string if needed
//     const normalizeField = (field) => Array.isArray(field) ? field[0] : field;

//     firstName = normalizeField(firstName);
//     lastName = normalizeField(lastName);
//     username = normalizeField(username);
//     email = normalizeField(email);
//     studentClass = normalizeField(studentClass);
//     section = normalizeField(section);
//     rollNumber = normalizeField(rollNumber);
//     gender = normalizeField(gender);
//     dateOfBirth = normalizeField(dateOfBirth);
//     phone = normalizeField(phone);
//     status = normalizeField(status);

//     // Validate class ObjectId if provided
//     if (studentClass && !mongoose.Types.ObjectId.isValid(studentClass)) {
//       return res.status(400).json({ message: "Invalid class ID" });
//     }

//     const updates = {};
//     if (firstName) updates.firstName = firstName;
//     if (lastName) updates.lastName = lastName;
//     if (username) updates.username = username;
//     if (email) updates.email = email;
//     if (studentClass) updates.class = mongoose.Types.ObjectId(studentClass);
//     if (section) updates.section = section;
//     if (rollNumber) updates.rollNumber = rollNumber;
//     if (gender) updates.gender = gender;
//     if (address) updates.address = address;
//     if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
//     if (phone) updates.phone = phone;
//     if (status) updates.status = status;

//     // Password hashing
//     if (password) updates.password = await bcrypt.hash(password, 10);

//     // Profile picture upload
//     if (file) {
//       const fileUri = getDataUri(file);
//       const cloudResponse = await cloudinary.uploader.upload(fileUri);
//       updates.profilePic = cloudResponse.secure_url;
//     }

//     // Find student
//     const student = await Student.findById(studentId);
//     if (!student) return res.status(404).json({ message: "Student not found" });

//     // Handle parentInfo
//     if (parentInfo) {
//       if (typeof parentInfo === "string") parentInfo = JSON.parse(parentInfo);
//       student.parentInfo = {
//         father: { ...student.parentInfo?.father, ...parentInfo.father },
//         mother: { ...student.parentInfo?.mother, ...parentInfo.mother },
//       };
//     }

//     // Update other fields
//     Object.assign(student, updates);
//     await student.save();

//     return res.status(200).json({
//       success: true,
//       message: "Student details updated successfully",
//       student,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: `Failed to update student: ${error.message}` });
//   }
// };




// // export const getStudents = async (req, res) => {
// //   try {
// //     const students = await Student.find().select("-password");
// //     res.status(200).json({
// //       success: true,
// //       TotalStudents: students.length,
// //       students
// //     });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };



// // export const getStudents = async (req, res) => {
// //   try {
// //     const students = await Student.find()
// //       .select("-password")                  // exclude password
// //       .populate("class", "name")            // populate class name
// //       .populate("section", "name");         // populate section name

// //     res.status(200).json({
// //       success: true,
// //       TotalStudents: students.length,
// //       students
// //     });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };


// export const studentUpdateProfile = async (req, res) => {
//   try {
//     const studentId = req.user.id; // from authMiddleware("student")
//     const file = req.file;

//     const { firstName, lastName, username, email, password, gender, dateOfBirth, phone, parentInfo, } = req.body;

//     const updates = {};

//     // Basic info updates
//     if (firstName) updates.firstName = firstName;
//     if (lastName) updates.lastName = lastName;
//     if (username) updates.username = username;
//     if (email) updates.email = email;
//     if (gender) updates.gender = gender;
//     if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
//     if (phone) updates.phone = phone;

//     // Password hashing
//     if (password) {
//       updates.password = await bcrypt.hash(password, 10);
//     }

//     // Profile picture upload
//     if (file) {
//       const fileUri = getDataUri(file);
//       const cloudResponse = await cloudinary.uploader.upload(fileUri);
//       updates.profilePic = cloudResponse.secure_url;
//     }

//     const student = await Student.findById(studentId);
//     if (!student) {
//       return res.status(404).json({ success: false, message: "Student not found" });
//     }

//     // Update nested parent info
//     if (parentInfo) {
//       student.parentInfo = {
//         ...student.parentInfo.toObject(),
//         ...parentInfo,
//       };
//     }

//     Object.assign(student, updates);
//     await student.save();

//     return res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       student,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: `Failed to update profile: ${error.message}`,
//     });
//   }
// };




// // export const updateStudent = async (req, res) => {


// //   try {
// //     const studentId = req.user.id; // from authMiddleware
// //     const { email, phone, address } = req.body;
// //     const file = req.file;

// //     // Prepare update object with only allowed fields
// //     const updates = {};
// //     if (email) updates.email = email;
// //     if (phone) updates.phone = phone;
// //     if (address) updates.address = address;

// //     // Handle profile picture
// //     if (file) {
// //       const fileUri = getDataUri(file);
// //       const cloudResponse = await cloudinary.uploader.upload(fileUri);
// //       updates.profilePic = cloudResponse.secure_url;
// //     }

// //     // Update student in one query
// //     const updatedStudent = await Student.findByIdAndUpdate(
// //       studentId,
// //       { $set: updates },
// //       { new: true, runValidators: true, select: "-password" }
// //     );

// //     if (!updatedStudent) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Student not found"
// //       });
// //     }

// //     return res.status(200).json({
// //       success: true,
// //       message: "Profile updated successfully",
// //       student: updatedStudent
// //     });

// //   } catch (error) {
// //     console.error("Update student error:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: error.message || "Failed to update profile"
// //     });
// //   }


// // };



// // Delete student



// export const deleteStudent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Student.findByIdAndDelete(id);
//     res.status(200).json({
//       success: true,
//       message: "Student deleted succcessfully"
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };




// export const studentLogin = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // Find student by username
//     const student = await Student.findOne({ username });
//     if (!student)
//       return res.status(400).json({
//         success: false,
//         message: "Student not found",
//       });

//     // Check password
//     const isMatch = await bcrypt.compare(password, student.password);
//     if (!isMatch)
//       return res.status(400).json({
//         success: false,
//         message: "Invalid credentials",
//       });

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: student._id, role: "student" },
//       process.env.SECRET_KEY,
//       { expiresIn: "1d" }
//     );

//     // Return response
//     return res.status(200).json({
//       success: true,
//       message: `Welcome back ${student.firstName} ${student.lastName}`,
//       token,
//       student: {
//         id: student._id,
//         username: student.username,
//         name: student.name,
//         class: student.class,
//         section: student.section,
//         rollNo: student.rollNo,
//         email: student.email,
//         phone: student.phone,
//         address: student.address,
//         profilePic: student.profilePic,
//       },
//     });
//   } catch (err) {
//     console.error("Student login error:", err);
//     return res.status(500).json({
//       success: false,
//       message: `Failed to login: ${err.message}`,
//     });
//   }
// };



