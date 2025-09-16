'use client';

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Temporarily disable Firebase to prevent invalid API key errors
// Uncomment and configure with valid Firebase credentials when ready
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ABCDEF",
};

let app: any = null;
let auth: any = null;
let googleProvider: any = null;

// Only initialize Firebase if we have valid configuration
if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Set the OAuth client ID for Google Sign In
    googleProvider.setCustomParameters({
      client_id: '877325288078-9ucsetoei7u553nhmbir6ui69qba1hod.apps.googleusercontent.com'
    });
    
    googleProvider.setCustomParameters({ prompt: "select_account" });
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
  }
}

export { auth, googleProvider };
export default app;
