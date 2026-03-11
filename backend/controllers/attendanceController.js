import { Attendance } from "../models/attendanceModel.js";
import { AttendancePermission } from "../models/AttendancePermissionModel.js";
import { Teacher } from "../models/teacherModel.js";
import mongoose from "mongoose";
import { Student } from "../models/studentModel.js";


export const markAttendance = async (req, res) => {
  try {
    const { classId, sectionId } = req.params;
    const { students } = req.body; // students = [{studentId, status}, {...}]
    const teacherId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ Validate student list
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid students data" });
    }

    // ✅ Check if already marked for this class-section-date
    const alreadyMarked = await Attendance.findOne({
      classId,
      sectionId,
      date: today,
    });

    if (alreadyMarked) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for today. Please use the update option.",
      });
    }

    // ✅ Check permission if teacher
    if (req.user.role === "teacher") {
      const permission = await AttendancePermission.findOne({
        classId,
        sectionId,
        teacherId,
        validUntil: { $gte: new Date() },
      });

      if (!permission) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to mark attendance for this section",
        });
      }
    }

    // ✅ Save attendance for each student
    const records = students.map((s) => ({
      studentId: s.studentId,
      classId,
      sectionId,
      date: today,
      status: s.status.charAt(0).toUpperCase() + s.status.slice(1).toLowerCase(), // normalize
      markedBy: teacherId,
      locked: false,
    }));

    await Attendance.insertMany(records);

    res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
    });
  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



// export const markAttendance = async (req, res) => {
//   try {
//     const { classId, sectionId } = req.params;
//     const students = req.body.students || req.body.records || [];
//     const teacherId = req.user.id; 
//     const today = new Date().setHours(0, 0, 0, 0);

//     if (!Array.isArray(students) || students.length === 0) {
//       return res.status(400).json({ message: "No attendance data provided" });
//     }

//     const permission = await AttendancePermission.findOne({
//       classId,
//       sectionId,
//       teacherId,
//       validUntil: { $gte: new Date() },
//     });

//     if (!permission && req.user.role === "teacher") {
//       return res.status(403).json({ message: "You do not have permission to mark attendance for this section" });
//     }

//     for (let s of students) {
//       await Attendance.findOneAndUpdate(
//         { studentId: s.studentId, classId, sectionId, date: today },
//         {
//           $set: {
//             status: s.status,
//             markedBy: teacherId,
//             locked: false,
//           },
//         },
//         { upsert: true, new: true }
//       );
//     }

//     res.status(200).json({ success: true, message: "Attendance marked successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };



// ✅ Update attendance for a student
export const editAttendance = async (req, res) => {
  try {
    const { classId, sectionId, studentId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    const today = new Date().setHours(0, 0, 0, 0);
    const attendance = await Attendance.findOne({ classId, sectionId, studentId });
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });

    const attendanceDate = new Date(attendance.date).setHours(0, 0, 0, 0);

    // Rules
    if (role === "teacher" && today !== attendanceDate)
      return res.status(403).json({ message: "Teachers can only update today's attendance" });

    if (role === "admin" && today - attendanceDate > 5 * 24 * 60 * 60 * 1000)
      return res.status(403).json({ message: "Admin can only update attendance up to 5 days old" });

    attendance.status = status;
    attendance.updatedBy = userId;
    await attendance.save();

    // 🔔 Placeholder: send real-time notification about updated attendance
    // sendAttendanceUpdateNotification(studentId);

    res.status(200).json({ success: true, message: "Attendance updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get attendance report for a class/section
export const getAttendanceReport = async (req, res) => {
  try {
    const { classId, sectionId } = req.params;
    const { date, fromDate, toDate } = req.query;

    let filter = { classId, sectionId };

    if (date) {
      const d = new Date(date).setHours(0, 0, 0, 0);
      filter.date = d;
    } else if (fromDate && toDate) {
      filter.date = {
        $gte: new Date(fromDate).setHours(0, 0, 0, 0),
        $lte: new Date(toDate).setHours(23, 59, 59, 999),
      };
    }

    const records = await Attendance.find(filter)
      .populate("studentId", "firstName lastName rollNumber")
      .populate("markedBy", "name");

    res.status(200).json({ success: true, records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




export const markAttendanceByTeacher = async (req, res) => {
  try {
    const { classId, sectionId } = req.params;
    const {  students} = req.body; // support both "records" or "students"
    const teacherId = req.user.id;

    // Accept either "records" or "students"
    const attendanceData = students;
    if (!attendanceData || !Array.isArray(attendanceData) || attendanceData.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid attendance data" });
    }

    // Verify teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const classIdStr = String(classId);
    const sectionIdStr = String(sectionId);
    const teacherIdStr = String(teacher._id);

    // Permission check
    const isClassTeacher = teacher.classTeacherOf?.some(
      (t) =>
        String(t.class) === classIdStr &&
        String(t.section) === sectionIdStr
    );

    const hasPermission = await AttendancePermission.findOne({
      classId: mongoose.Types.ObjectId(classIdStr),
      sectionId: mongoose.Types.ObjectId(sectionIdStr),
      teacherId: mongoose.Types.ObjectId(teacherIdStr),
      validUntil: { $gte: new Date() },
    });

    if (!isClassTeacher && !hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to mark attendance for this section",
      });
    }

    // Determine attendance date
    const attendanceDate = new Date(date || Date.now());
    attendanceDate.setHours(0, 0, 0, 0);

    // Prevent duplicate attendance for same day
    const existingRecords = await Attendance.find({
      classId: classIdStr,
      sectionId: sectionIdStr,
      date: attendanceDate,
    });

    if (existingRecords.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this date",
      });
    }

    // Validate each studentId
    const validRecords = attendanceData
      .filter((r) => r.studentId && mongoose.Types.ObjectId.isValid(r.studentId))
      .map((r) => ({
        studentId: mongoose.Types.ObjectId(r.studentId),
        classId: mongoose.Types.ObjectId(classIdStr),
        sectionId: mongoose.Types.ObjectId(sectionIdStr),
        markedBy: mongoose.Types.ObjectId(teacherIdStr),
        date: attendanceDate,
        status:
          r.status?.charAt(0).toUpperCase() + r.status?.slice(1).toLowerCase() || "Present",
        locked: false,
      }));

    if (validRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid student IDs provided",
      });
    }

    // Save all attendance records
    await Attendance.insertMany(validRecords);

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
    });
  } catch (err) {
    console.error("Error marking attendance by teacher:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ✅ Get attendance for a specific class-section-date (teacher side)

export const getAttendanceByTeacher = async (req, res) => {
  try {
    const { classId, sectionId } = req.params;
    const { date } = req.query;

    const records = await Attendance.find({
      classId,
      sectionId,
      date: new Date(date),
    }).populate("studentId", "firstName lastName rollNumber"); // <-- populate student

    // Transform to include top-level student fields for frontend
    const formattedRecords = records.map((r) => ({
      _id: r._id,
      studentId: r.studentId._id,
      firstName: r.studentId.firstName,
      lastName: r.studentId.lastName,
      username: r.studentId.username,
      rollNumber: r.studentId.rollNumber,
      status: r.status,
    }));

    res.status(200).json({ records: formattedRecords });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};







// ✅ Update attendance for a specific date (teacher side)


export const updateAttendanceByTeacher = async (req, res) => {
  try {
    const { classId, sectionId } = req.params;
    const { date, students } = req.body;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ message: "Invalid students data" });
    }

    for (const s of students) {
      await Attendance.findOneAndUpdate(
        {
          classId,
          sectionId,
          studentId: s.studentId,
          date: {
            $gte: new Date(date),
            $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
          },
        },
        { $set: { status: s.status } },
        { new: true }
      );
    }

    res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ message: "Server error while updating attendance" });
  }
};


export const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user.id; // from auth middleware
    const { date, fromDate, toDate } = req.query;

    let filter = { studentId: new mongoose.Types.ObjectId(studentId) };

    // Filter by exact date
    if (date) {
      const d = new Date(date);
      filter.date = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lt: new Date(d.setHours(23, 59, 59, 999)),
      };
    } 
    // Filter by date range
    else if (fromDate && toDate) {
      filter.date = {
        $gte: new Date(new Date(fromDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(toDate).setHours(23, 59, 59, 999)),
      };
    }

    // Fetch records and populate references
    const records = await Attendance.find(filter)
      .populate("classId", "className")      // populate class name
      .populate("sectionId", "sectionName")  // populate section name
      .populate("markedBy", "firstName lastName name role") // teacher/admin who marked
      .sort({ date: -1 });

    res.status(200).json({ success: true, records });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({ message: "Server error while fetching attendance" });
  }
};




// export const getStudentAttendance = async (req, res) => {
//   try {
//     const studentId = req.user.id;

//     const { date, fromDate, toDate } = req.query;

//     let filter = { studentId: new mongoose.Types.ObjectId(studentId) };

//     if (date) {
//       const d = new Date(date);
//       const start = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0));
//       const end = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999));
//       filter.date = { $gte: start, $lte: end };
//     } else if (fromDate && toDate) {
//       const from = new Date(fromDate);
//       const to = new Date(toDate);
//       const start = new Date(Date.UTC(from.getFullYear(), from.getMonth(), from.getDate(), 0, 0, 0));
//       const end = new Date(Date.UTC(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999));
//       filter.date = { $gte: start, $lte: end };
//     }

//     const records = await Attendance.find(filter)
//       .populate("classId", "name")
//       .populate("sectionId", "name")
//       .sort({ date: -1 });

//     res.status(200).json({ success: true, records });
//   } catch (error) {
//     console.error("Error fetching student attendance:", error);
//     res.status(500).json({ message: "Server error while fetching attendance" });
//   }
// };













