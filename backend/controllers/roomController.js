import { Room } from "../models/roomModel.js";


// Add a room (Admin only)
export const addRoom = async (req, res) => {
  try {
    const { name, location, capacity } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Room name is required" });

    const room = await Room.create({ name, location, capacity });
    return res.status(201).json({ success: true, message: "Room added", room });
  } catch (err) {
    console.error("addRoom:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get all rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ name: 1 }); // sorted alphabetically
    return res.json({ success: true, rooms });
  } catch (err) {
    console.error("getRooms:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get single room by id (optional)
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    return res.json({ success: true, room });
  } catch (err) {
    console.error("getRoomById:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByIdAndDelete(id);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    return res.json({ success: true, message: "Room deleted" });
  } catch (err) {
    console.error("deleteRoom:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};