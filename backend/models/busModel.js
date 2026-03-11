import mongoose from "mongoose";

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  driverName: { type: String, required: true },
  driverPhone: { type: String, required: true },
  driverLicense: { type: String },
  busType: {
    type: String,
    enum: ["Omni", "Eeco", "Mini Bus", "Big Bus"],
    default: "Eeco"
  },
  route: { type: mongoose.Schema.Types.ObjectId, ref: "BusRoute" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
}, { timestamps: true });

export const Bus = mongoose.model("Bus", busSchema);
