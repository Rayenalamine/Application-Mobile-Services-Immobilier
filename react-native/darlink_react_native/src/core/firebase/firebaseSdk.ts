// ============================================================
// DARLINK — OFFICIAL FIREBASE JS SDK (React Native / Expo / Web)
// Provides real Firestore onSnapshot() listeners and Firebase Auth
// state with React Native AsyncStorage persistence (compatible with
// Expo Go and Expo Development Builds).
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { defaultFirebaseConfig } from './firebaseConfig';

let appInstance: FirebaseApp | null = null;
let authInstance: firebaseAuth.Auth | null = null;
let firestoreInstance: Firestore | null = null;

function isReactNativeRuntime(): boolean {
  return typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
}

export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(defaultFirebaseConfig);
  }
  return appInstance;
}

export function getFirebaseAuth(): firebaseAuth.Auth {
  if (!authInstance) {
    const app = getFirebaseApp();
    const getRnPersistence = (firebaseAuth as unknown as {
      getReactNativePersistence?: (storage: typeof AsyncStorage) => firebaseAuth.Persistence;
    }).getReactNativePersistence;

    if (isReactNativeRuntime() && typeof getRnPersistence === 'function') {
      try {
        authInstance = firebaseAuth.initializeAuth(app, {
          persistence: getRnPersistence(AsyncStorage),
        });
      } catch {
        authInstance = firebaseAuth.getAuth(app);
      }
    } else {
      authInstance = firebaseAuth.getAuth(app);
    }
  }
  return authInstance;
}

export function getFirebaseDb(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }
  return firestoreInstance;
}
