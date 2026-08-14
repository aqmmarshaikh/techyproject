import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase project configuration for techyboy-projects
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBP3Sgb6ZQRNFKQJb_j2x3G9tK1jBtRLmY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "techyboy-projects.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://techyboy-projects-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "techyboy-projects",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "techyboy-projects.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "848314679799",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:848314679799:web:d7fc363449444fe04deef2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PG1RJM6HX3"
};

// Initialize Firebase cleanly without duplicate app errors
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Analytics support (initialized asynchronously if supported in environment)
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export default app;
