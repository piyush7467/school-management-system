import { TransportAssignment } from "../models/transportAssignmentModel.js";
import { Bus } from "../models/busModel.js";
import { BusRoute } from "../models/busRouteModel.js";
import mongoose from "mongoose";
import { sendFcmNotification } from "../utils/fcm.js"; 
import { Notification } from "../models/notificationModel.js";

// ➤ Assign Student to Bus
export const assignTransport = async (req, res) => {
  try {
    const { studentId, busId, stop } = req.body;

    // Validate input
    if (!studentId || !busId || !stop) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Find bus and its route
    const bus = await Bus.findById(busId).populate("route");
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });
    if (!bus.route) return res.status(404).json({ success: false, message: "Route not found" });

    // Validate stop
    const stopData = bus.route.stops.find(
      s => s.stopName.trim().toLowerCase() === stop.trim().toLowerCase()
    );

    if (!stopData) {
      return res.status(400).json({
        success: false,
        message: `Invalid stop. Available stops: ${bus.route.stops.map(s => s.stopName).join(", ")}`
      });
    }

    // Create transport assignment
    const assignment = await TransportAssignment.create({
      studentId,
      busId,
      stop: stopData.stopName,
      pickupTime: stopData.pickupTime,
      dropTime: stopData.dropTime
    });

    // Populate assignment in one go
    await assignment.populate([
      { path: "studentId", select: "firstName lastName rollNo classId fcmToken" },
      { 
        path: "busId", 
        select: "busNumber driverName driverPhone type route",
        populate: { path: "route", select: "routeName source destination stops" }
      }
    ]);

    if (!assignment) {
      return res.status(500).json({ success: false, message: "Transport assignment failed" });
    }

    const student = assignment.studentId;

    // ✅ Send FCM if token exists
    if (student?.fcmToken) {
      const title = "New Transport Assigned";
      const body = `Hello ${student.firstName}, your transport has been assigned:
Bus ${assignment.busId.busNumber}, Stop: ${stopData.stopName}, Pickup: ${stopData.pickupTime}`;

      console.log("Sending FCM to token:", student.fcmToken);
      await sendFcmNotification(student.fcmToken, { title, body, data: { url: `/student/transport/${assignment._id}` } });

      // Save notification in DB
      await Notification.create({
        user: student._id,
        title,
        body,
        data: { assignmentId: assignment._id },
        read: false
      });
    }

    // Respond with populated assignment
    res.status(201).json({
      success: true,
      message: "Student assigned successfully and notification sent",
      assignment: {
        ...assignment.toObject(),
        student: assignment.studentId,
        bus: assignment.busId,
        route: assignment.busId?.route || null
      }
    });

  } catch (error) {
    console.error("Error in assignTransport:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// export const assignTransport = async (req, res) => {
//   try {
//     const { studentId, busId, stop } = req.body;

//     if (!studentId || !busId || !stop) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "All fields are required" 
//       });
//     }

//     // Find the bus and populate its route
//     const bus = await Bus.findById(busId).populate("route");
//     if (!bus) return res.status(404).json({ 
//       success: false, 
//       message: "Bus not found" 
//     });

//     const route = bus.route;
//     if (!route) return res.status(404).json({ 
//       success: false, 
//       message: "Route not found" 
//     });

//     // Validate stop
//     const stopData = route.stops.find(
//       (s) => s.stopName.trim().toLowerCase() === stop.trim().toLowerCase()
//     );

//     if (!stopData) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid stop. Available stops: ${route.stops.map(s => s.stopName).join(", ")}`
//       });
//     }

//     // Create the assignment
//     const assignment = await TransportAssignment.create({
//       studentId,
//       busId,
//       stop: stopData.stopName,
//       pickupTime: stopData.pickupTime,
//       dropTime: stopData.dropTime
//     });

//     // Populate the assignment document properly
//     const populatedAssignment = await TransportAssignment.findById(assignment._id)
//       .populate("studentId", "firstName lastName rollNo classId fcmToken")
//       .populate({
//         path: "busId",
//         select: "busNumber driverName driverPhone type route",
//         populate: { path: "route", select: "routeName source destination stops" }
//       });

//     // ✅ Send FCM notification if student has token
//     const student = populatedAssignment.studentId;
//     if (student?.fcmToken) {
//       await sendFcmNotification(student.fcmToken, {
//         title: "New Transport Assigned",
//         body: `Hello ${student.firstName}, your transport has been assigned: Bus ${populatedAssignment.bus.busNumber}, Stop: ${stopData.stopName}, Pickup: ${stopData.pickupTime}`
//       });
//     }

//     res.status(201).json({
//       success: true,
//       message: "Student assigned successfully and notification sent",
//       assignment: {
//         ...populatedAssignment.toObject(),
//         student: populatedAssignment.studentId,
//         bus: populatedAssignment.busId,
//         route: populatedAssignment.busId?.route || null
//       }
//     });

//   } catch (error) {
//     console.error("Error in assignTransport:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



// export const assignTransport = async (req, res) => {
//   try {
//     const { studentId, busId, stop } = req.body;

//     if (!studentId || !busId || !stop) {
//       return res.status(400).json({ success: false, message: "All fields are required" });
//     }

//     // Find the bus and populate its route
//     const bus = await Bus.findById(busId).populate("route");
//     if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

//     const route = bus.route;
//     if (!route) return res.status(404).json({ success: false, message: "Route not found" });

//     // Validate stop
//     const stopData = route.stops.find(
//       (s) => s.stopName.trim().toLowerCase() === stop.trim().toLowerCase()
//     );

//     if (!stopData) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid stop. Available stops: ${route.stops.map(s => s.stopName).join(", ")}`
//       });
//     }

//     // Create the assignment
//     const assignment = await TransportAssignment.create({
//       studentId,
//       busId,
//       stop: stopData.stopName,
//       pickupTime: stopData.pickupTime,
//       dropTime: stopData.dropTime
//     });

//     // Populate the assignment document properly
//     const populatedAssignment = await TransportAssignment.findById(assignment._id)
//       .populate("studentId", "firstName lastName rollNo classId")
//       .populate({
//         path: "busId",
//         select: "busNumber driverName driverPhone type route",
//         populate: { path: "route", select: "routeName source destination stops" }
//       });

//     res.status(201).json({
//       success: true,
//       message: "Student assigned successfully",
//       assignment: {
//         ...populatedAssignment.toObject(),
//         student: populatedAssignment.studentId,
//         bus: populatedAssignment.busId,
//         route: populatedAssignment.busId?.route || null
//       }
//     });

//   } catch (error) {
//     console.error("Error in assignTransport:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// ➤ Get All Assignments (Admin)

export const getAllAssignments = async (req, res) => {
  try {
    const assignments = await TransportAssignment.find()
      .populate("studentId", "firstName lastName rollNo classId")
      .populate({
        path: "busId",
        select: "busNumber driverName driverPhone route",
        populate: {
          path: "route",
          select: "routeName source destination stops" // include stops if needed
        }
      });


    const mappedAssignments = assignments.map(a => ({
      ...a.toObject(),
      student: a.studentId,
      bus: a.busId,
      route: a.busId?.route || null
    }));

    res.status(200).json({ success: true, assignments: mappedAssignments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➤ Get Student’s Own Assignment
export const getMyTransport = async (req, res) => {
  try {
    const { id } = req.user;

    const assignment = await TransportAssignment.findOne({ studentId: id })
      .populate({
        path: "busId",
        populate: { path: "route", select: "routeName stops source destination" }
      })
      .populate("studentId", "firstName lastName rollNo classId");

    // ✅ Handle not found
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "No transport assignment found for this student.",
      });
    }

    // ✅ Safely access populated fields
    res.status(200).json({
      success: true,
      assignment: {
        ...assignment.toObject(),
        student: assignment.studentId,
        bus: assignment.busId,
        route: assignment.busId?.route || null,
      },
    });

  } catch (error) {
    console.error("Error in getMyTransport:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ➤ Update Assignment
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, busId, stop } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid assignment ID" });
    }
    if (!studentId || !busId || !stop) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const bus = await Bus.findById(busId).populate("route");
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });

    const route = await BusRoute.findById(bus.route);
    if (!route) return res.status(404).json({ success: false, message: "Route not found" });

    const stopData = route.stops.find(
      (s) => s.stopName.trim().toLowerCase() === stop.trim().toLowerCase()
    );
    if (!stopData) {
      return res.status(400).json({
        success: false,
        message: `Invalid stop. Available stops: ${route.stops.map(s => s.stopName).join(", ")}`
      });
    }

    const updatedAssignment = await TransportAssignment.findByIdAndUpdate(
      id,
      {
        studentId,
        busId,
        stop: stopData.stopName,
        pickupTime: stopData.pickupTime,
        dropTime: stopData.dropTime
      },
      { new: true }
    )
      .populate("studentId", "firstName lastName rollNo classId")
      .populate("busId", "busNumber driverName driverPhone route");

    if (!updatedAssignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      assignment: {
        ...updatedAssignment.toObject(),
        student: updatedAssignment.studentId,
        bus: updatedAssignment.busId,
        route: updatedAssignment.busId?.route || null
      }
    });
  } catch (error) {
    console.error("Error in updateAssignment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➤ Delete Assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid assignment ID" });
    }

    const deletedAssignment = await TransportAssignment.findByIdAndDelete(id);

    if (!deletedAssignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
      assignmentId: id
    });
  } catch (error) {
    console.error("Error in deleteAssignment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
