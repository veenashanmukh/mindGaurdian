// ============================================================
// AUTHENTICATION SYSTEM - ANONYMOUS USERNAME/PASSWORD
// ============================================================
// Updated: January 2025
// Version: 2.0 (Pivoted from Email-based to Username-based)
// ============================================================

/**
 * ARCHITECTURE OVERVIEW
 * ====================
 * 
 * User Flow:
 * 1. User lands on /auth (AuthPage.jsx)
 * 2. User chooses "Create Account" or "Login"
 * 3. For registration:
 *    - Enter username (min 3 chars, max 20 chars)
 *    - Username checked for availability in real-time
 *    - Enter password (min 6 chars)
 *    - Confirm password must match
 *    - On submit:
 *      - Check username uniqueness in Firestore `usernames` collection
 *      - Generate pseudo-email: `username@mindguardian.anon`
 *      - Create Firebase Auth user with pseudo-email + password
 *      - Reserve username in Firestore `usernames` collection
 *      - Create user profile in Firestore `users` collection
 *      - Redirect to /dashboard
 * 
 * 4. For login:
 *    - Enter username
 *    - Enter password
 *    - On submit:
 *      - Generate pseudo-email from username
 *      - Sign in to Firebase Auth with pseudo-email + password
 *      - Update last login timestamp
 *      - Fetch full profile from Firestore
 *      - Redirect to /dashboard
 */

/**
 * KEY FUNCTIONS IN authService.js
 * ================================
 */

// 1. generatePseudoEmail(username)
//    - Private helper function
//    - Converts "john" → "john@mindguardian.anon"
//    - Used internally to interface with Firebase Auth (which requires email)
//    - User never sees this email

// 2. usernameExists(username) → Promise<boolean>
//    - Checks if username is taken
//    - Queries Firestore `usernames` collection
//    - Returns true if username exists, false if available
//    - Called during registration form for real-time availability check

// 3. registerUser(username, password) → Promise<{success, uid?, error?}>
//    - Registers new anonymous user with username + password
//    - Returns: { success: true, uid, user: userProfile } on success
//    - Returns: { success: false, error: "..." } on failure
//    - Validations:
//      - Username min 3 chars
//      - Password min 6 chars
//      - Username must be unique
//    - Creates:
//      - Firebase Auth user (with pseudo-email)
//      - Username reservation in Firestore
//      - User profile document with empty data structures

// 4. loginUser(username, password) → Promise<{success, uid?, error?}>
//    - Logs in existing user with username + password
//    - Returns: { success: true, uid, user: userProfile } on success
//    - Returns: { success: false, error: "..." } on failure
//    - Updates last login timestamp
//    - Fetches full profile from Firestore

// 5. logoutUser() → Promise<{success, error?}>
//    - Signs out current user from Firebase Auth
//    - Clears local auth state

// 6. onAuthChange(callback) → Function (unsubscriber)
//    - Monitors Firebase Auth state changes
//    - Calls callback with user object (or null if logged out)
//    - Includes full Firestore profile data
//    - Used to keep app synced with auth state

// 7. getUserProfile(uid) → Promise<{success, profile?, error?}>
//    - Fetches specific user's profile from Firestore
//    - Returns: { success: true, profile: {...} } on success
//    - Returns: { success: false, error: "..." } on failure

// 8. logUserInteraction(uid, type) → Promise<{success, error?}>
//    - Increments interaction counter for analytics
//    - Types: "appSession", "gamePlay", "journalWrite", "recordingAdd"
//    - Used for personalization and engagement tracking


/**
 * FIRESTORE DATA STRUCTURE
 * =======================
 */

// Collection: usernames (reserved usernames)
// Document ID: username (lowercase)
// Fields:
// {
//   uid: "firebase-uid"  // references users collection
// }

// Collection: users
// Document ID: user UID (from Firebase Auth)
// Fields:
// {
//   uid: "firebase-uid",
//   username: "john",
//   createdAt: "2025-01-15T10:30:00.000Z",
//   lastLogin: "2025-01-15T10:30:00.000Z",
//   audios: [],              // voice recordings
//   journals: [],            // journal entries
//   situations: [],          // situational check-ins
//   reflections: [],         // generated reflections
//   goals: [],               // user goals + roadmaps
//   interactions: {
//     appSessions: 5,        // number of times app opened
//     gamesPlayed: 12,       // number of games completed
//     journalsWritten: 8,    // number of journals created
//     recordingsAdded: 3,    // number of voice recordings
//   },
//   preferences: {
//     theme: "light",        // or "dark"
//     notifications: true,   // push notifications enabled
//   }
// }


/**
 * UI COMPONENTS IN AuthPage.jsx
 * ==============================
 */

// Elements:
// 1. Header: Logo + subtitle
// 2. Form with:
//    - Username input (3-20 chars)
//    - Real-time availability indicator (Checking... / Available / Taken)
//    - Password input (6+ chars)
//    - Confirm Password input (register mode only)
// 3. Error message display (if validation fails)
// 4. Submit button (disabled if username taken or validation fails)
// 5. Toggle button to switch between login/register modes
// 6. Anonymous note: "🔐 Your username keeps you anonymous. No email, no tracking."

// Styling: Modern gradient design with smooth animations
// Responsive: Mobile-friendly (tested down to 480px)


/**
 * FIREBASE AUTH SETUP REQUIRED
 * ============================
 * 
 * Your Firebase project needs:
 * 1. Authentication enabled (Email/Password provider)
 * 2. Firestore database (with rules allowing authenticated users to write)
 * 3. Firestore security rules (see FIRESTORE_RULES.txt)
 * 
 * Example security rules:
 * 
 * rules_version = '3';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Allow users to read/write their own profile
 *     match /users/{userId} {
 *       allow read, write: if request.auth.uid == userId;
 *     }
 *     
 *     // Allow reading/writing username reservations
 *     match /usernames/{username} {
 *       allow read: if true;
 *       allow write: if request.auth != null;
 *     }
 *   }
 * }
 */


/**
 * ERROR HANDLING
 * ==============
 */

// Registration errors:
// - "Username must be at least 3 characters"
// - "Username already taken"
// - "Password must be at least 6 characters"
// - Firebase Auth errors (e.g., weak password, service unavailable)

// Login errors:
// - "Username or password incorrect"
// - Firebase Auth errors (e.g., too many login attempts, service unavailable)

// All errors are user-friendly and displayed in red banner


/**
 * NEXT STEPS / TODO
 * =================
 */

// Priority 1:
// [ ] Test registration flow end-to-end
// [ ] Test login flow end-to-end
// [ ] Test username availability check
// [ ] Test navigation to /dashboard after login
// [ ] Verify Firestore rules are correct

// Priority 2:
// [ ] Add password reset functionality
// [ ] Add "forgot username" functionality
// [ ] Add username validation (alphanumeric, underscores only)
// [ ] Add rate limiting for failed login attempts

// Priority 3:
// [ ] Add social login (Google, Apple)
// [ ] Add two-factor authentication
// [ ] Add account deletion
// [ ] Export user data to CSV
