import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy singleton — initializes only when first accessed (client-side only)
let _app: FirebaseApp | null = null;
let _db: Database | null = null;

function getApp(): FirebaseApp {
  if (!_app) {
    if (!firebaseConfig.databaseURL) {
      throw new Error(
        "Missing NEXT_PUBLIC_FIREBASE_DATABASE_URL.\n" +
        "Copy .env.example → .env.local and fill in your Firebase credentials."
      );
    }
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;
  }
  return _app;
}

export function getDb(): Database {
  if (!_db) {
    _db = getDatabase(getApp());
  }
  return _db;
}

export function isFirebaseConfigured(): boolean {
  return !!firebaseConfig.databaseURL;
}
