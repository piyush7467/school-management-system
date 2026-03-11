import { Complaint } from "../models/complaintModel.js";

// Student/Teacher files complaint
export const createComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { id, role } = req.user; // from auth middleware

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description required" });
    }

    const complaint = new Complaint({
      userId: id,
      userRole: role === "student" ? "Student" : "Teacher",
      title,
      description
    });

    await complaint.save();
    res.status(201).json({ success: true, message: "Complaint submitted", complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// User views their complaints
export const getMyComplaints = async (req, res) => {
  try {
    const { id, role } = req.user;

    const complaints = await Complaint.find({ userId: id, userRole: role === "student" ? "Student" : "Teacher" });
    res.status(200).json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin views all complaints
// export const getAllComplaints = async (req, res) => {
//   try {
//     const complaints = await Complaint.find()
//       .populate("userId", "name rollNo email"); // Show student/teacher info
//     res.status(200).json({ success: true, complaints });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate({
        path: "userId",
        select: "firstName lastName name rollNumber email", // fetch all needed fields
      })
      .sort({ createdAt: -1 }); // optional: show latest first

    res.status(200).json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Admin updates complaint status and reply
export const updateComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, adminReply } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { status, adminReply },
      { new: true }
    );

    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    res.status(200).json({ success: true, message: "Complaint updated", complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
