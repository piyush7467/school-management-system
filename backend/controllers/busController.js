import { Bus } from "../models/busModel.js";

// ➤ Create Bus

export const createBus = async (req, res) => {
  try {
    const {
      busNumber,
      capacity,
      driverName,
      driverPhone,
      driverLicense,
      busType,
      routeId, // <-- accept routeId
      status,
    } = req.body;

    if (!busNumber || !capacity || !driverName || !driverPhone) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newBus = await Bus.create({
      busNumber,
      capacity,
      driverName,
      driverPhone,
      driverLicense,
      busType,
      route: routeId || null, // <-- map routeId to route
      status,
    });

    // Populate route so frontend immediately sees it
    await newBus.populate("route", "routeName");

    res.status(201).json({ success: true, message: "Bus created successfully", bus: newBus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ➤ Get All Buses
export const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find().populate("route", "routeName source destination");
    res.status(200).json({ success: true, buses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➤ Get Bus by ID
export const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).populate("route");
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });
    res.status(200).json({ success: true, bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➤ Update Bus
export const updateBus = async (req, res) => {
  try {
    const updatedBus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBus) return res.status(404).json({ success: false, message: "Bus not found" });
    res.status(200).json({ success: true, message: "Bus updated", bus: updatedBus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➤ Delete Bus
export const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: "Bus not found" });
    res.status(200).json({ success: true, message: "Bus deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
