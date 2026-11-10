export const APP_CONFIG = {
  appName: import.meta.env.VITE_APP_NAME || 'Project Hub',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'project-hub-demo',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
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

