// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

let app, db, auth;
let firebaseAvailable = false;

// ✅ Use Vite environment variables instead of process.env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC6PgEnE5bS10vlHZBpwhMc4iPWmG3kOmk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "foodzy-app-d1a8d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "foodzy-app-d1a8d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "foodzy-app-d1a8d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "960591233189",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:960591233189:web:f0dc7ade952a91cbbc0d4c",
  measurementId: "G-3TP901PH13"
};

try {
  // Prevent multiple initialization errors
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  db = getFirestore(app);
  auth = getAuth(app);

  firebaseAvailable = true;
  console.log("✅ Firebase initialized successfully.");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
}

export { app, db, auth, firebaseAvailable };
export default app;
