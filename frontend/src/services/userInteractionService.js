// ============================================================
// User Interaction Logging Service
// ============================================================
// Purpose: Track all user activities (voices, journals, games)
//          to personalize recommendations and analyze patterns
// Storage: Firebase Firestore (under user's document)
// Why: Enables AI-powered insights and progress tracking
// ============================================================

import { db, auth } from "./firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

// Log a new journal entry
export async function logJournalEntry(entry) {
  const uid = auth.currentUser?.uid;
  if (!uid) return { success: false, error: "Not authenticated" };

  try {
    await updateDoc(doc(db, "users", uid), {
      journals: arrayUnion({
        ...entry,
        timestamp: new Date().toISOString(),
      }),
    });

    // Increment journal counter
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const current = userDoc.data().interactions?.journalsWritten || 0;
      await updateDoc(doc(db, "users", uid), {
        "interactions.journalsWritten": current + 1,
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Log a voice recording metadata
export async function logVoiceRecording(metadata) {
  const uid = auth.currentUser?.uid;
  if (!uid) return { success: false, error: "Not authenticated" };

  try {
    await updateDoc(doc(db, "users", uid), {
      audios: arrayUnion({
        ...metadata,
        timestamp: new Date().toISOString(),
      }),
    });

    // Increment recording counter
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const current = userDoc.data().interactions?.recordingsAdded || 0;
      await updateDoc(doc(db, "users", uid), {
        "interactions.recordingsAdded": current + 1,
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Log a game session
export async function logGameSession(gameName, duration) {
  const uid = auth.currentUser?.uid;
  if (!uid) return { success: false, error: "Not authenticated" };

  try {
    await updateDoc(doc(db, "users", uid), {
      gamesSessions: arrayUnion({
        game: gameName,
        duration,
        timestamp: new Date().toISOString(),
      }),
    });

    // Increment games counter
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const current = userDoc.data().interactions?.gamesPlayed || 0;
      await updateDoc(doc(db, "users", uid), {
        "interactions.gamesPlayed": current + 1,
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Log daily app session
export async function logAppSession() {
  const uid = auth.currentUser?.uid;
  if (!uid) return { success: false, error: "Not authenticated" };

  try {
    // Increment session counter
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const current = userDoc.data().interactions?.appSessions || 0;
      await updateDoc(doc(db, "users", uid), {
        "interactions.appSessions": current + 1,
        lastSessionDate: new Date().toISOString(),
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Log a situation/mood marker
export async function logSituation(situation) {
  const uid = auth.currentUser?.uid;
  if (!uid) return { success: false, error: "Not authenticated" };

  try {
    await updateDoc(doc(db, "users", uid), {
      situations: arrayUnion({
        text: situation,
        timestamp: new Date().toISOString(),
      }),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get user's recent activities (for dashboard insights)
export async function getUserActivities(uid, limit = 30) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) {
      return { success: false, error: "User not found" };
    }

    const data = userDoc.data();
    return {
      success: true,
      activities: {
        recentJournals: (data.journals || []).slice(-limit),
        recentRecordings: (data.audios || []).slice(-limit),
        recentSituations: (data.situations || []).slice(-limit),
        interactions: data.interactions || {},
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
