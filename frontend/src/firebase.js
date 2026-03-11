// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAjUOBGMz1A4IsdKYN48QgSy8GXd8dA_og",
  authDomain: "schoolmanagementsystem-2a5d9.firebaseapp.com",
  projectId: "schoolmanagementsystem-2a5d9",
  storageBucket: "schoolmanagementsystem-2a5d9.firebasestorage.app",
  messagingSenderId: "628616900713",
  appId: "1:628616900713:web:0635cae175cad0aa9a72f8"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
