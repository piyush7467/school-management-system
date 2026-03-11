// src/utils/fcm.js
import { messaging } from "../firebase";
import { getToken } from "firebase/messaging";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BNA_dJScgZiN..."; // put in .env

export const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    // Register service worker (must be at root /firebase-messaging-sw.js)
    let swRegistration;
    try {
      swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.log("Service worker registered:", swRegistration.scope);
    } catch (err) {
      console.error("SW registration failed:", err);
      // continue attempts to getToken — but likely will fail without SW
    }

    const token = await getToken(messaging, {
      vapidKey: 'BNA_dJScgZiNBkGixVqgVB1EmW6u5aSg5yXLfBvAGsRbITSvSVcNG6gz_TudbO5qOQvTaTuXV-l7L2fyRvHXSrw',
      serviceWorkerRegistration: swRegistration
    });

    console.log("FCM Token:", token);
    return token;
  } catch (error) {
    console.error("FCM Error:", error);
    return null;
  }
};
