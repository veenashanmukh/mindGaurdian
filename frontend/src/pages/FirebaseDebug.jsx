import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { db, analytics, isFirebaseAvailable, firebaseConfig } from "../services/firebase";
import { saveUserProfile } from "../services/userService";
import Card from "../components/common/Card";

export default function FirebaseDebug() {
  const { user } = useContext(UserContext);
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  const log = (msg) => {
    setOutput((prev) => prev + msg + "\n");
    console.log(msg);
  };

  // Test 1: Check Firebase Config
  const testConfig = () => {
    log("=== Testing Firebase Config ===");
    log(`API Key: ${firebaseConfig.apiKey ? "✓ Configured" : "✗ Missing"}`);
    log(`Project ID: ${firebaseConfig.projectId || "✗ Missing"}`);
    log(`Auth Domain: ${firebaseConfig.authDomain || "✗ Missing"}`);
    log(`Storage Bucket: ${firebaseConfig.storageBucket || "✗ Missing"}`);
    log(`App ID: ${firebaseConfig.appId || "✗ Missing"}`);
    log(`Measurement ID: ${firebaseConfig.measurementId || "✗ Missing"}`);
    log(`\nFirebase Available: ${isFirebaseAvailable ? "✓ YES" : "✗ NO"}`);
    log(`Firestore DB: ${db ? "✓ Initialized" : "✗ Not initialized"}`);
    log(`Analytics: ${analytics ? "✓ Initialized" : "✗ Not initialized"}`);
    setTestResults((prev) => ({ ...prev, config: "passed" }));
  };

  // Test 2: Save User Profile (Firestore + localStorage)
  const testSaveProfile = async () => {
    setLoading(true);
    log("\n=== Testing Save User Profile ===");
    try {
      const result = await saveUserProfile({
        ...user,
        timestamp: new Date().toISOString(),
        testEntry: "FirebaseDebug test",
      });
      log(`✓ Profile saved to: ${result.savedTo}`);
      log(`User data: ${JSON.stringify(user, null, 2).substring(0, 200)}...`);
      setTestResults((prev) => ({ ...prev, saveProfile: "passed" }));
    } catch (err) {
      log(`✗ Error saving profile: ${err.message}`);
      setTestResults((prev) => ({ ...prev, saveProfile: "failed" }));
    }
    setLoading(false);
  };

  // Test 3: Direct Firestore write (to verify connection)
  const testFirestoreWrite = async () => {
    setLoading(true);
    log("\n=== Testing Direct Firestore Write ===");
    try {
      if (!db) {
        log("✗ Firestore DB not initialized");
        setTestResults((prev) => ({ ...prev, firestoreWrite: "failed" }));
        setLoading(false);
        return;
      }

      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      const testRef = doc(db, "test", `test_${Date.now()}`);
      await setDoc(testRef, {
        message: "Firebase is working!",
        timestamp: serverTimestamp(),
      });
      log("✓ Successfully wrote test document to Firestore");
      log(`Document ID: test_${Date.now()}`);
      log("Check Firebase Console → test collection to verify");
      setTestResults((prev) => ({ ...prev, firestoreWrite: "passed" }));
    } catch (err) {
      log(`✗ Firestore write failed: ${err.message}`);
      log(`This usually means: Network issue, wrong API key, or Firestore rules`);
      setTestResults((prev) => ({ ...prev, firestoreWrite: "failed" }));
    }
    setLoading(false);
  };

  // Test 4: Analytics test
  const testAnalytics = () => {
    log("\n=== Testing Analytics ===");
    try {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "firebase_debug_test", { debug: true });
        log("✓ Google Analytics (gtag) is available");
      } else if (analytics) {
        log("✓ Firebase Analytics initialized");
        log("Note: Check Firebase Console → Analytics for events");
      } else {
        log("⚠ Analytics not available (this is OK - feature is optional)");
      }
      setTestResults((prev) => ({ ...prev, analytics: "passed" }));
    } catch (err) {
      log(`✗ Analytics error: ${err.message}`);
    }
  };

  // Test 5: Network connectivity
  const testNetworkConnectivity = async () => {
    log("\n=== Testing Network Connectivity ===");
    try {
      const response = await fetch("https://www.google.com", {
        method: "HEAD",
        mode: "no-cors",
      });
      log("✓ Network connectivity: OK");
      setTestResults((prev) => ({ ...prev, network: "passed" }));
    } catch (err) {
      log(`✗ Network issue detected: ${err.message}`);
      setTestResults((prev) => ({ ...prev, network: "failed" }));
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setOutput("");
    log("🚀 Starting Firebase Diagnostic Tests...\n");
    testConfig();
    await testFirestoreWrite();
    testSaveProfile();
    testAnalytics();
    await testNetworkConnectivity();
    log("\n✅ Diagnostic complete!");
  };

  const passCount = Object.values(testResults).filter((r) => r === "passed").length;
  const failCount = Object.values(testResults).filter((r) => r === "failed").length;

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h2>🔧 Firebase Diagnostic Tool</h2>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
        Use this tool to verify Firebase is working correctly in your app.
      </p>

      <Card style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>Quick Status</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Firebase Available</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: isFirebaseAvailable ? "#10b981" : "#ef4444" }}>
              {isFirebaseAvailable ? "✓ YES" : "✗ NO"}
            </div>
          </div>
          <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Firestore DB</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: db ? "#10b981" : "#ef4444" }}>
              {db ? "✓ Ready" : "✗ Not init"}
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>Test Results</h3>
        <div style={{ display: "flex", gap: 12, marginBottom: "1.5rem" }}>
          <div style={{ padding: "0.75rem 1rem", background: "#dcfce7", borderRadius: 8, color: "#166534", fontWeight: 600 }}>
            ✓ Passed: {passCount}
          </div>
          <div style={{ padding: "0.75rem 1rem", background: "#fee2e2", borderRadius: 8, color: "#991b1b", fontWeight: 600 }}>
            ✗ Failed: {failCount}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <button onClick={runAllTests} disabled={loading} style={{ fontWeight: 600 }}>
            {loading ? "Running..." : "🚀 Run All Tests"}
          </button>
          <button onClick={testConfig} style={{ background: "#f3f4f6", color: "#374151" }}>
            Config
          </button>
          <button onClick={testFirestoreWrite} disabled={loading} style={{ background: "#f3f4f6", color: "#374151" }}>
            Firestore Write
          </button>
          <button onClick={testSaveProfile} disabled={loading} style={{ background: "#f3f4f6", color: "#374151" }}>
            Save Profile
          </button>
          <button onClick={testAnalytics} style={{ background: "#f3f4f6", color: "#374151" }}>
            Analytics
          </button>
          <button onClick={async () => {
            // Fire the app's analytics events for demo/proof
            setOutput("");
            log('\n=== Firing Demo Analytics Events ===');
            try {
              const { trackOnboardingComplete, trackSituationalCheckCompleted, trackDashboardViewed, trackSuggestionUsed } = await import('../services/analyticsService');
              trackOnboardingComplete();
              log('Sent onboarding_complete');
              trackSituationalCheckCompleted();
              log('Sent situational_check_completed');
              trackDashboardViewed();
              log('Sent dashboard_viewed');
              trackSuggestionUsed('2-minute breathing exercise');
              log('Sent suggestion_used (breathing)');
            } catch (err) {
              log('Error firing demo analytics: ' + (err?.message || err));
            }
          }} style={{ background: '#e9d5ff', color: '#4c1d95' }}>
            Fire Demo Events
          </button>
          <button onClick={testNetworkConnectivity} style={{ background: "#f3f4f6", color: "#374151" }}>
            Network
          </button>
        </div>

        <button
          onClick={() => setOutput("")}
          style={{ background: "#f3f4f6", color: "#374151", padding: "0.5rem 1rem", fontSize: 12 }}
        >
          Clear Output
        </button>
      </Card>

      <Card style={{ background: "#1f2937", color: "#e5e7eb", padding: "1rem", fontFamily: "monospace", fontSize: 12, maxHeight: 400, overflowY: "auto" }}>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
          {output || "Run tests to see output here..."}
        </pre>
      </Card>

      <Card style={{ marginTop: "1.5rem", background: "#fef3c7", borderLeft: "4px solid #f59e0b" }}>
        <h4 style={{ marginTop: 0 }}>📚 How Firebase is used in your app:</h4>
        <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
          <li><strong>firebase.js</strong> - Initializes Firestore, Auth, Storage, and Analytics with your project config</li>
          <li><strong>userService.js</strong> - Saves user profiles to Firestore (tries Firestore first, fallback to localStorage)</li>
          <li><strong>analyticsService.js</strong> - Sends analytics events to Firebase/Google Analytics</li>
          <li><strong>Dashboard.jsx</strong> - Checks if Firebase is available and displays status</li>
        </ul>
      </Card>

      <Card style={{ marginTop: "1.5rem", background: "#dbeafe", borderLeft: "4px solid #3b82f6" }}>
        <h4 style={{ marginTop: 0 }}>🔗 Next Steps:</h4>
        <ol style={{ margin: 0, paddingLeft: "1.5rem" }}>
          <li>Click <strong>Run All Tests</strong> to diagnose any issues</li>
          <li>If Firestore write fails, check Firebase Console → Firestore → Rules (should allow reads/writes for testing)</li>
          <li>View saved data in Firebase Console → Firestore → users collection</li>
          <li>Monitor analytics in Firebase Console → Analytics</li>
        </ol>
      </Card>
    </div>
  );
}
