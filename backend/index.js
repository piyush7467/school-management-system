// ----------------------------
// Existing imports
// ----------------------------
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './database/db.js';
import adminRoute from './routes/adminAuthRoutes.js';
import studentRoute from './routes/studentRoute.js';
import teacherRoute from './routes/teacherRoute.js';
import { seedAdmin } from './utils/seedAdmin.js';
import fcmRoute from "./routes/fcmRoutes.js";

// ----------------------------
// Express app setup
// ----------------------------
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// ----------------------------
// Routes
// ----------------------------
app.use('/api/admin/auth', adminRoute);
app.use('/api/student/auth', studentRoute);
app.use('/api/teacher/auth', teacherRoute);
app.use("/api/user", fcmRoute);

// ----------------------------
// 🔔 Optional: Test FCM Notification Route
// ----------------------------
import { sendFcmNotification } from './utils/fcm.js';

app.post('/api/notify', async (req, res) => {
  const { token, title, body } = req.body;

  try {
    const response = await sendFcmNotification(token, { title, body });
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('❌ FCM Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------
// Start server after DB connection and admin seeding
// ----------------------------
const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();
    console.log('✅ Admin seeding done');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
};

startServer();
