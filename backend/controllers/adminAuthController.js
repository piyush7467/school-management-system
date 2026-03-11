import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModel.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";
import { Announcement } from "../models/announcementModel.js";
import { Teacher } from "../models/teacherModel.js";
import { AttendancePermission } from "../models/AttendancePermissionModel.js";

export const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const admin = await Admin.findOne({ username });
        if (!admin)
            return res.status(400).json({
                success: false,
                message: "Admin not found"
            });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch)
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });

        const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.SECRET_KEY, {
            expiresIn: "1d"
        });

        return res.status(200).json({
            success: true,
            message: `Welcome back ${admin.name}`,
            token,
            user: {
                username: admin.username,
                name: admin.name,
                role:'admin',
                email: admin.email,
                phone: admin.phone,
                address: admin.address,
                profilePic: admin.profilePic,
                _id: admin._id
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Failed to login: ${err}`
        });
    }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin)
      return res.status(404).json({ success: false, message: "Admin not found" });

    res.status(200).json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { name, username, email, phone, address, gender } = req.body;
    const file = req.file;

    if (!adminId) {
      return res.status(400).json({ success: false, message: "Admin ID missing" });
    }

    const updates = {};
    if (name) updates.name = name;
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (gender) updates.gender = gender;

    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri);
      updates.profilePic = cloudResponse.secure_url;
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

// Admin creates announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, target } = req.body;
    const adminId = req.user.id;

    if (!title || !message || !target || target.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const announcement = await Announcement.create({
      title,
      message,
      target,
      createdBy: adminId,
    });

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      announcement,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Fetch announcements for a student/teacher
// export const getAnnouncements = async (req, res) => {
//   try {
//     let announcements;

//     if (req.user.role === "admin") {
//       // Admin sees only announcements created by themselves
//       announcements = await Announcement.find({ createdBy: req.user.id })
//         .sort({ createdAt: -1 });
//     } else {
//       // Teacher/student sees only announcements targeted to them
//       announcements = await Announcement.find({ target: req.user.role })
//         .sort({ createdAt: -1 });
//     }

//     res.status(200).json({ success: true, announcements });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const getAnnouncements = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "admin") {
      filter = { createdBy: req.user.id };
    } else {
      // Match if user's role is in target array OR target includes "all"
      filter = { target: { $in: [req.user.role.toLowerCase(), "all"] } };
    }

    const announcements = await Announcement.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Admin must be authenticated, and middleware should set req.user = logged-in admin
export const assignClassTeacher = async (req, res) => {
  try {
    const { teacherId, classId, sectionId } = req.body;

    // Make sure admin is logged in
    const adminId = req.user.id;
    if (!adminId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher)
      return res.status(404).json({ 
    success: false, 
    message: "Teacher not found" 
  });

    // Check if already assigned
    const alreadyAssigned = teacher.classTeacherOf.some(
      (t) => t.class.toString() === classId && t.section.toString() === sectionId
    );

    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ success: false, message: "Teacher already assigned to this class-section" });
    }

    // Assign class-section
    teacher.classTeacherOf.push({ class: classId, section: sectionId });
    await teacher.save();

    // Grant attendance permission (valid 1 year) using logged-in admin
    const permission = new AttendancePermission({
      teacherId,
      classId,
      sectionId,
      grantedBy: adminId,
      validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    });
    await permission.save();

    res.status(200).json({
      success: true,
      message: "Class teacher assigned and attendance permission granted",
      teacher,
      permission,
    });
  } catch (err) {
    console.error("Error assigning class teacher:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




// Get all class-teacher assignments along with attendance permission
export const getClassTeacherAssignments = async (req, res) => {
  try {
    // Fetch all teachers with their classTeacherOf populated
    const teachers = await Teacher.find()
      .populate("classTeacherOf.class", "name")   // populate class name
      .populate("classTeacherOf.section", "name") // populate section name
      .lean();

    const assignments = teachers.flatMap((t) =>
      t.classTeacherOf.map((ct) => ({
        assignmentId: ct._id,
        teacherId: t._id,
        teacherName: t.name,                 // from Teacher
        classId: ct.class._id,
        className: ct.class.name,            // from Class
        sectionId: ct.section._id,
        sectionName: ct.section.name,        // from Section
      }))
    );

    res.status(200).json({ success: true, assignments });
  } catch (err) {
    console.error("Error fetching class-teacher assignments:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Unassign a class teacher and remove attendance permission
import mongoose from "mongoose";

export const unassignClassTeacher = async (req, res) => {
  try {
    let { assignmentId } = req.params;
    assignmentId = assignmentId.trim();

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: "Invalid assignment ID" });
    }

    const teacher = await Teacher.findOne({ "classTeacherOf._id": assignmentId });
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    // Find index of assignment
    const index = teacher.classTeacherOf.findIndex(
      (ct) => ct._id.toString() === assignmentId
    );

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    // Remove assignment from array
    const removed = teacher.classTeacherOf.splice(index, 1)[0];
    await teacher.save();

    // Remove attendance permission
    await AttendancePermission.deleteOne({
      teacherId: teacher._id,
      classId: removed.class,
      sectionId: removed.section,
    });

    res.status(200).json({ success: true, message: "Teacher unassigned and permission removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};






