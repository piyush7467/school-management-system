import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const serviceAccountPath = path.join(__dirname, "../config/serviceAccountKey.json");

const serviceAccountPath = path.join(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize only if not already initialized
const firebaseApp = !admin.apps.length
  ? admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  : admin.app();

export default admin;

// Or export helper function
export const sendFcmNotification = async (fcmToken, message) => {
  if (!fcmToken) return;

  const payload = {
    notification: { title: message.title, body: message.body, sound: "default" },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(payload);
    console.log("FCM sent:", response);
    return response;
  } catch (err) {
    console.error("FCM Error:", err);
  }
};
