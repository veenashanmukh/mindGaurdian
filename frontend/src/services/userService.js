// userService: saves user profile to Firestore when available, otherwise localStorage
import { db, isFirebaseAvailable } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const STORAGE_KEY = "mg_user_profile";

export async function saveUserProfile(user) {
  try {
    if (isFirebaseAvailable && db) {
      const ref = doc(db, "users", user.name || "anonymous");
      await setDoc(ref, user, { merge: true });
      return { savedTo: "firestore" };
    }
  } catch (err) {
    // ignore and fallback to local
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return { savedTo: "localStorage" };
  } catch (err) {
    return { savedTo: "none" };
  }
}

export function loadUserProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}
