// ============================================================
// DARLINK — CONFIGURATION FIREBASE (React Native Expo)
// Supporte les variables d'environnement Expo Public et les valeurs cloud
// ============================================================

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Configuration Firebase par défaut pour DarLink Immo Tunisie
// Peut être surchargée via les variables d'environnement EXPO_PUBLIC_FIREBASE_*
export const defaultFirebaseConfig: FirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDbKXIPYXNnE8ZICmVfMXhf6lRGTA--a0A',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'darlink-74715.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'darlink-74715',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'darlink-74715.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '844919536034',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:844919536034:web:beaea4072bf457a62e5afb',
};

export const getFirebaseConfig = (): FirebaseConfig => defaultFirebaseConfig;

