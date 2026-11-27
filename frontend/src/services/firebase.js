// Firebase initialization using provided project config
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration (provided)
const firebaseConfig = {
  apiKey: "AIzaSyBxObQzEVrj8Ur1NsYID2AUs1Grq55k608",
  authDomain: "mindguardian-201225.firebaseapp.com",
  projectId: "mindguardian-201225",
  storageBucket: "mindguardian-201225.firebasestorage.app",
  messagingSenderId: "385708223674",
  appId: "1:385708223674:web:272b34d71def83d3742683",
  measurementId: "G-30JYPTBGBW"
};

// Initialize Firebase app and services
const app = initializeApp(firebaseConfig);
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  // Analytics may fail in some environments (e.g. dev without window), ignore safely
  analytics = null;
}

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const isFirebaseAvailable = true; // Always available with provided config

// Exports: app, initialized services, and the raw config
export { app, analytics, db, auth, storage, firebaseConfig, isFirebaseAvailable };
