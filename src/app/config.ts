export const APP_CONFIG = {
  appName: import.meta.env.VITE_APP_NAME || 'Project Hub',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDYC0k_j0SRoO01cQ1GIzAUGdATD0-7nuo',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'techyprojects1-da98c.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'techyprojects1-da98c',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'techyprojects1-da98c.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '403067015603',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:403067015603:web:af7d99e864469642807bc6',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-CKBZG8DFR3',
    useEmulators: import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true',
    emulatorHosts: {
      auth: import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099',
      firestore: import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || 'localhost:8080',
      functions: import.meta.env.VITE_FUNCTIONS_EMULATOR_HOST || 'localhost:5001',
    },
  },
  cloudinary: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
  },
  defaults: {
    arenaMinVoteThreshold: 10,
    maxImageSizeMb: 5,
    maxScreenshots: 6,
  },
} as const;
