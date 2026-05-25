importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyC_5i0Hm8tX20efkRCABvZBuB8GI7FqbaE",
  authDomain: "classplus-58498.firebaseapp.com",
  projectId: "classplus-58498",
  storageBucket: "classplus-58498.firebasestorage.app",
  messagingSenderId: "29042598214",
  appId: "1:29042598214:web:72d08c6e75d68760bdc547",
  measurementId: "G-6500BCWGNX"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    try {
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: 'assignment-notification',
        data: payload.data,
        requireInteraction: true
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    } catch (error) {
      console.error('[firebase-messaging-sw.js] Error showing notification:', error);
    }
  });

  console.log('[firebase-messaging-sw.js] Successfully initialized Firebase messaging');
} catch (error) {
  console.error('[firebase-messaging-sw.js] Error initializing Firebase:', error);
}
