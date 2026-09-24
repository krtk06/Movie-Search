import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Firebase bootstrap.
 *
 * Auth is wired to Firebase when the VITE_FIREBASE_* env vars are present.
 * When they are not, the app falls back to a local demo mode (see
 * Context/AuthContext.jsx) so the app remains usable for development.
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId
);

let auth = null;
let initError = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (err) {
    initError = err;
    auth = null;
  }
}

export function getFirebaseAuth() {
  return auth;
}

export function getFirebaseInitError() {
  return initError;
}
