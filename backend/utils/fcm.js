import admin from "firebase-admin";

// Parse Firebase service account JSON from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Initialize Firebase only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;

// Helper function to send FCM notifications
export const sendFcmNotification = async (fcmToken, message) => {
  if (!fcmToken) return;

  const payload = {
    notification: {
      title: message.title,
      body: message.body,
      sound: "default",
    },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(payload);
    console.log("FCM sent:", response);
    return response;
  } catch (error) {
    console.error("FCM Error:", error);
  }
};