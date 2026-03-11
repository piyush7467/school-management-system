import { requestPermission } from "./fcm";
import API from "@/api/axios";

export const saveFcmToken = async (authToken) => {
  try {
    const fcmToken = await requestPermission();
    if (fcmToken) {
      await API.post(
        "/user/fcm-token",
        { fcmToken },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log("✅ FCM token saved successfully");
    }
  } catch (err) {
    console.error("❌ Error saving FCM token:", err);
  }
};
