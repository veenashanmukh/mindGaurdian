// ============================================================
// Authentication Service (Anonymous Username-Based)
// ============================================================
// Purpose: Anonymous user registration with username + password
// Note: No email required — generates internal pseudo-email
//       Username stored in Firestore for user identity
// Why: Keeps users anonymous while tracking progress personalized
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

// Generate pseudo-email from username for Firebase Auth
function generatePseudoEmail(username) {
  return `${username.toLowerCase()}@mindguardian.anon`;
}

// Check if username already exists
export async function usernameExists(username) {
  try {
    const pseudoEmail = generatePseudoEmail(username);
    // Try to sign in — if it fails with auth/user-not-found, username is available
    // This is not ideal UX but Firebase doesn't have a direct username query on Auth
    // Better approach: query Firestore for usernames
    const userQuery = await getDoc(doc(db, "usernames", username.toLowerCase()));
    return userQuery.exists();
  } catch (error) {
    return false;
  }
}

// Register new user with anonymous username
export async function registerUser(username, password) {
  try {
    // Validate username
    if (!username || username.length < 3) {
      return { success: false, error: "Username must be at least 3 characters" };
    }

    // Check if username already taken
    const usernameDoc = await getDoc(doc(db, "usernames", username.toLowerCase()));
    if (usernameDoc.exists()) {
      return { success: false, error: "Username already taken" };
    }

    // Generate pseudo-email and create Firebase Auth user
    const pseudoEmail = generatePseudoEmail(username);
    const userCred = await createUserWithEmailAndPassword(auth, pseudoEmail, password);
    const uid = userCred.user.uid;

    // Reserve username
    await setDoc(doc(db, "usernames", username.toLowerCase()), { uid });

    // Create Firestore profile document with username
    const userProfile = {
      uid,
      username,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      // Empty data structures for user interactions and content
      audios: [],
      journals: [],
      situations: [],
      reflections: [],
      goals: [],
      interactions: {
        appSessions: 0,
        gamesPlayed: 0,
        journalsWritten: 0,
        recordingsAdded: 0,
      },
      preferences: {
        theme: "light",
        notifications: true,
      },
    };

    await setDoc(doc(db, "users", uid), userProfile);
    return { success: true, uid, user: userProfile };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Login with username and password
export async function loginUser(username, password) {
  try {
    // Generate pseudo-email from username
    const pseudoEmail = generatePseudoEmail(username);

    // Sign in with pseudo-email and password
    const userCred = await signInWithEmailAndPassword(auth, pseudoEmail, password);
    const uid = userCred.user.uid;

    // Update last login timestamp
    await updateDoc(doc(db, "users", uid), {
      lastLogin: new Date().toISOString(),
    });

    // Fetch full profile from Firestore
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return { success: true, uid, user: userDoc.data() };
    }
    return { success: false, error: "User profile not found" };
  } catch (error) {
    if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
      return { success: false, error: "Username or password incorrect" };
    }
    return { success: false, error: error.message };
  }
}

// Logout current user
export async function logoutUser() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Monitor authentication state changes
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        callback({ ...user, profile: userDoc.data() });
      }
    } else {
      callback(null);
    }
  });
}

// Fetch user's profile data from Firestore
export async function getUserProfile(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return { success: true, profile: userDoc.data() };
    }
    return { success: false, error: "Profile not found" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Log user interaction (for analytics and personalization)
export async function logUserInteraction(uid, type) {
  // type: "appSession", "gamePlay", "journalWrite", "recordingAdd"
  try {
    const typeMap = {
      appSession: "appSessions",
      gamePlay: "gamesPlayed",
      journalWrite: "journalsWritten",
      recordingAdd: "recordingsAdded",
    };

    const fieldName = typeMap[type];
    if (!fieldName) return { success: false, error: "Unknown interaction type" };

    // Increment counter for this interaction type
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const current = userDoc.data().interactions[fieldName] || 0;
      await updateDoc(doc(db, "users", uid), {
        [`interactions.${fieldName}`]: current + 1,
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Legacy placeholder function
export async function isAuthenticated() {
  return auth.currentUser !== null;
}
