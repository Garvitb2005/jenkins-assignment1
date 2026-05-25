import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { vapidKeys } from './vapidKeys';
import { updateFcmToken } from '../services/api';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_5i0Hm8tX20efkRCABvZBuB8GI7FqbaE",
  authDomain: "classplus-58498.firebaseapp.com",
  projectId: "classplus-58498",
  storageBucket: "classplus-58498.firebasestorage.app",
  messagingSenderId: "29042598214",
  appId: "1:29042598214:web:72d08c6e75d68760bdc547",
  measurementId: "G-6500BCWGNX"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
let messaging: any = null;

const initializeFirebaseMessaging = async () => {
  if (!messaging && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered with scope:', registration.scope);

      messaging = getMessaging(app);

      // Handle foreground messages
      onMessage(messaging, (payload) => {
        console.log('Received foreground message:', payload);
        if (Notification.permission === 'granted') {
          new Notification(payload.notification?.title || 'New Assignment', {
            body: payload.notification?.body
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Error initializing messaging:', error);
      throw error;
    }
  }
  return null;
};

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw error;
}

const auth = getAuth(app);

// Function to get FCM token with auth
export const getFCMTokenWithAuth = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to get FCM token');
    }

    // Get fresh ID token
    const idToken = await currentUser.getIdToken(true);
    console.log('Got fresh ID token for FCM');

    // Initialize messaging if not already initialized
    const registration = await initializeFirebaseMessaging();
    if (!registration || !messaging) {
      throw new Error('Failed to initialize messaging');
    }

    // Get the token with proper VAPID key
    const token = await getToken(messaging, {
      vapidKey: vapidKeys.publicKey,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      throw new Error('Failed to get FCM token');
    }

    // Update FCM token in the backend
    await updateFcmToken(token);

    console.log('Successfully obtained and updated FCM token');
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    throw error;
  }
};

export { app, auth, messaging };
