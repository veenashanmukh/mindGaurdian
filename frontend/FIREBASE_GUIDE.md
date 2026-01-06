# Firebase Usage in MindGuardian

## Overview
Firebase is **optionally integrated** into MindGuardian. The app works completely fine WITHOUT Firebase (fallback to localStorage), but can save data to the cloud when Firebase is configured.

---

## How Firebase is Used

### 1. **Initialization** (`src/services/firebase.js`)
- **What**: Initializes Firebase with your project credentials
- **Config**: Uses hardcoded Firebase config with project ID `mindguardian-201225`
- **Services Initialized**:
  - **Firestore (db)** - Cloud database
  - **Auth (auth)** - Authentication (not used yet)
  - **Storage (storage)** - File storage (not used yet)
  - **Analytics (analytics)** - Event tracking
- **Exports**: `db`, `analytics`, `app`, `auth`, `storage`, `isFirebaseAvailable`

### 2. **User Profiles** (`src/services/userService.js`)
- **What**: Saves user profile data (name, age, energy, situations, journals, etc.)
- **How**:
  1. Tries to save to **Firestore** at path: `users/{username}`
  2. If Firestore fails/unavailable, fallbacks to **localStorage**
  3. Always returns `{ savedTo: "firestore" | "localStorage" }`
- **When**: Called whenever you need to persist user data
- **Example**:
  ```javascript
  import { saveUserProfile } from "../services/userService";
  
  await saveUserProfile(user);
  // Returns: { savedTo: "firestore" } or { savedTo: "localStorage" }
  ```

### 3. **Analytics** (`src/services/analyticsService.js`)
- **What**: Sends event tracking data
- **How**:
  1. Tries **Google Analytics (gtag)** if configured
  2. Then tries **Firebase Analytics** if initialized
  3. Falls back to **console.log** for debugging
- **When**: Called to track user actions (optional)
- **Example**:
  ```javascript
  import { trackEvent } from "../services/analyticsService";
  
  trackEvent("user_completed_check", { energy: "high" });
  ```

### 4. **Dashboard Status** (`src/pages/Dashboard.jsx`)
- Imports `isFirebaseAvailable` to conditionally show Firebase status
- Currently just displays the availability flag

---

## How to Check if Firebase is Working

### **Method 1: Use the Firebase Debug Page** (Easiest!)
1. Navigate to: `http://localhost:5173/debug`
2. Click **"Run All Tests"**
3. You'll see:
   - ✓ Config status (all required fields)
   - ✓ Firestore connection test
   - ✓ Direct write test (creates test collection)
   - ✓ Analytics test
   - ✓ Network connectivity

### **Method 2: Check Browser Console**
```javascript
// Open browser DevTools → Console and run:
import { db, analytics, isFirebaseAvailable } from "./src/services/firebase.js"
console.log("Firebase Available:", isFirebaseAvailable)
console.log("Firestore DB:", db)
console.log("Analytics:", analytics)
```

### **Method 3: Firebase Console**
1. Go to: https://console.firebase.google.com/
2. Select project: **mindguardian-201225**
3. Check these sections:
   - **Firestore Database** → Should show `users` collection after first save
   - **Analytics** → Should show events after trackEvent() calls
   - **Realtime Database** → Not used (we use Firestore)

### **Method 4: Test Save & Check**
```javascript
// In any component:
import { saveUserProfile } from "../services/userService";

// Save user data
const result = await saveUserProfile({
  name: "Test User",
  email: "test@example.com"
});

console.log(result); // { savedTo: "firestore" } or { savedTo: "localStorage" }

// Then check Firebase Console → Firestore → users collection
```

---

## Current Firebase Usage in App

| Feature | File | Firebase Used | Status |
|---------|------|---------------|--------|
| Save User Profile | userService.js | ✓ Firestore | Integrated |
| Track Events | analyticsService.js | ✓ Analytics | Integrated |
| Auth | authService.js | ✗ Not used | Placeholder |
| File Upload | Not yet | ✗ Not used | Future |
| Real-time Sync | Not yet | ✗ Not used | Future |

---

## Troubleshooting Firebase Issues

### ❌ Problem: "Firestore write failed"
**Solutions**:
1. Check Firebase Console → Firestore → Rules
2. For testing, temporarily use this rule:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   ⚠️ This is for testing only! Secure before production.

3. Check API key in `firebase.js` matches your project

### ❌ Problem: "Analytics not available"
**Solutions**:
- This is OK! Analytics is optional
- Verify in Firebase Console → Analytics → Dashboard
- Events should appear within a few minutes

### ❌ Problem: "Network error"
**Solutions**:
1. Check internet connection
2. Check browser DevTools → Network tab for failed requests
3. Check CORS - Firebase SDK should handle this automatically

### ❌ Problem: "Authentication error"
**Solutions**:
1. Verify API key is correct (check Firebase Console → Project Settings)
2. Verify project ID matches
3. Check if Firebase project is still active

---

## How to Verify Data is Being Saved

### To Firestore:
```
Firebase Console → mindguardian-201225 → Firestore Database → Collections
You should see a "users" collection with documents like:
├── users/
│   ├── Prarthana (Document)
│   │   ├── name: "Prarthana"
│   │   ├── age: "25"
│   │   ├── energy: "normal"
│   │   ├── situations: [...]
│   │   └── journals: [...]
```

### To LocalStorage (Fallback):
```
Browser DevTools → Application → Local Storage → http://localhost:5173
Look for key: `mg_user_profile`
```

---

## Adding Firebase Features

### To add a new Firestore collection:
```javascript
// In src/services/someService.js
import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export async function saveData(data) {
  try {
    const docRef = await addDoc(collection(db, "my_collection"), data);
    return docRef.id;
  } catch (err) {
    console.error("Firestore error:", err);
    // Fallback to localStorage
  }
}
```

### To add analytics tracking:
```javascript
import { trackEvent } from "../services/analyticsService";

// In your component:
trackEvent("button_clicked", { button_name: "start_breathing" });
trackEvent("user_mood", { mood: "stressed", energy: "low" });
```

---

## Quick Links

- **Firebase Project**: https://console.firebase.google.com/project/mindguardian-201225
- **Firebase Documentation**: https://firebase.google.com/docs
- **Firestore Query Reference**: https://firebase.google.com/docs/firestore/query-data/queries

