// models/Room.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const roomSchema = new Schema({
  name: { type: String, required: true },
  location: { type: String },
  capacity: { type: Number },
}, { timestamps: true });

export const Room = mongoose.model("Room", roomSchema);
