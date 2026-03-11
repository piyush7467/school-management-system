import { BusRoute } from "../models/busRouteModel.js";

// ➤ Create Route
export const createRoute = async (req, res) => {
  try {
    const { routeName, source, destination, stops, timing } = req.body;

    if (!routeName || !source || !destination || !stops?.length) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    // Validate stops
    for (const stop of stops) {
      if (!stop.stopName || !stop.pickupTime || !stop.dropTime) {
        return res.status(400).json({ success: false, message: "Each stop must have stopName, pickupTime, and dropTime" });
      }
    }

    const newRoute = await BusRoute.create({ routeName, source, destination, stops, timing });
    res.status(201).json({ success: true, message: "Route created successfully", route: newRoute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➤ Get All Routes
export const getAllRoutes = async (req, res) => {
  try {
    const routes = await BusRoute.find();
    res.status(200).json({ success: true, routes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➤ Get Route by ID
export const getRouteById = async (req, res) => {
  try {
    const route = await BusRoute.findById(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: "Route not found" });
    res.status(200).json({ success: true, route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➤ Update Route
export const updateRoute = async (req, res) => {
  try {
    const { stops } = req.body;

    // If stops are updated, validate each stop
    if (stops?.length) {
      for (const stop of stops) {
        if (!stop.stopName || !stop.pickupTime || !stop.dropTime) {
          return res.status(400).json({ success: false, message: "Each stop must have stopName, pickupTime, and dropTime" });
        }
      }
    }

    const updatedRoute = await BusRoute.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRoute) return res.status(404).json({ success: false, message: "Route not found" });
    res.status(200).json({ success: true, message: "Route updated", route: updatedRoute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➤ Delete Route
export const deleteRoute = async (req, res) => {
  try {
    const route = await BusRoute.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: "Route not found" });
    res.status(200).json({ success: true, message: "Route deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
