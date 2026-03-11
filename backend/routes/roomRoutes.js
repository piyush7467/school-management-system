import express from "express";
import { addRoom, deleteRoom, getRoomById, getRooms } from "../controllers/roomController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.post("/add", authMiddleware(["admin"]), addRoom);
router.get("/getall", authMiddleware(), getRooms);
router.get("/:id/get", authMiddleware(), getRoomById);
router.delete("/:id/delete", authMiddleware(["admin"]), deleteRoom);

export default router;
