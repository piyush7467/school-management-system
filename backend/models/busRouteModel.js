import mongoose from "mongoose";

const busRouteSchema = new mongoose.Schema({
  routeName: { type: String, required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  stops: [
    {
      stopName: { type: String, required: true },
      pickupTime: { type: String, required: true },  // e.g., "8:15 AM"
      dropTime: { type: String, required: true }     // e.g., "3:45 PM"
    }
  ],
  timing: { type: String }
}, { timestamps: true });

export const BusRoute = mongoose.model("BusRoute", busRouteSchema);
