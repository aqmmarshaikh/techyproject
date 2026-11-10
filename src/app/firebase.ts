import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { APP_CONFIG } from './config';

const firebaseConfig = {
  apiKey: APP_CONFIG.firebase.apiKey || 'AIzaSyDemoFallbackKeyOnlyForDevelopment',
  authDomain: APP_CONFIG.firebase.authDomain || 'project-hub-demo.firebaseapp.com',
  projectId: APP_CONFIG.firebase.projectId || 'project-hub-demo',
  storageBucket: APP_CONFIG.firebase.storageBucket || 'project-hub-demo.appspot.com',
  messagingSenderId: APP_CONFIG.firebase.messagingSenderId || '123456789012',
  appId: APP_CONFIG.firebase.appId || '1:123456789012:web:abcdef123456',
  measurementId: APP_CONFIG.firebase.measurementId,
};

// Singleton initialization
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

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

