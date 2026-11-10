import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { APP_CONFIG } from './config';

const firebaseConfig = {
  apiKey: APP_CONFIG.firebase.apiKey,
  authDomain: APP_CONFIG.firebase.authDomain,
  projectId: APP_CONFIG.firebase.projectId,
  storageBucket: APP_CONFIG.firebase.storageBucket,
  messagingSenderId: APP_CONFIG.firebase.messagingSenderId,
  appId: APP_CONFIG.firebase.appId,
  measurementId: APP_CONFIG.firebase.measurementId,
};

// Singleton initialization
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Analytics (Only initializes if supported in current browser environment)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn('[Firebase] Analytics initialization skipped:', err);
  });
}

// Connect to emulators if configured
if (APP_CONFIG.firebase.useEmulators && typeof window !== 'undefined') {
  try {
    const authUrl = `http://${APP_CONFIG.firebase.emulatorHosts.auth}`;
    connectAuthEmulator(auth, authUrl, { disableWarnings: true });
    
    const [fsHost, fsPort] = APP_CONFIG.firebase.emulatorHosts.firestore.split(':');
    connectFirestoreEmulator(db, fsHost, parseInt(fsPort, 10));

    const [fnHost, fnPort] = APP_CONFIG.firebase.emulatorHosts.functions.split(':');
    connectFunctionsEmulator(functions, fnHost, parseInt(fnPort, 10));
    
    console.info('[Firebase] Connected to local Firebase Emulators');
  } catch (err) {
    console.warn('[Firebase] Emulator connection skipped or already initialized:', err);
  }
}
