import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { saveFcmToken } from "../controllers/fcmController.js";


const router = express.Router();

// Save/update FCM token for logged-in user
router.post("/fcm-token", authMiddleware(['admin','student','teacher']), saveFcmToken);

export default router;
