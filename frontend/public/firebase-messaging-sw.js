// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAjUOBGMz1A4IsdKYN48QgSy8GXd8dA_og",
  authDomain: "schoolmanagementsystem-2a5d9.firebaseapp.com",
  projectId: "schoolmanagementsystem-2a5d9",
  storageBucket: "schoolmanagementsystem-2a5d9.firebasestorage.app",
  messagingSenderId: "628616900713",
  appId: "1:628616900713:web:0635cae175cad0aa9a72f8"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notification = payload.notification || {};
  const title = notification.title || 'Notification';
  const options = { body: notification.body || '', icon: '/favicon.ico' };
  self.registration.showNotification(title, options);
});
