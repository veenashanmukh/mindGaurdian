import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { saveUserProfile } from "../services/userService";
import { trackOnboardingComplete } from "../services/analyticsService";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(user?.age || "");

  const handleContinue = () => {
    if (!name || !age) return;

    setUser((prev) => ({
      ...prev,
      name,
      age,
    }));

    // persist profile (firestore if available, otherwise localStorage)
    try {
      saveUserProfile({ ...user, name, age }).catch(() => {});
    } catch (e) {}

    // anonymous analytics: onboarding complete
    try { trackOnboardingComplete(); } catch (e) {}

    // go to permissions flow immediately after onboarding
    navigate("/permissions");
  };

  return (
    <div style={{ padding: "3rem 1rem", display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 480, width: "100%" }}>
        <div style={{
          borderRadius: 24,
          padding: "2rem",
          background: "linear-gradient(180deg,#fff 0%, #fffafc 100%)",
          boxShadow: "0 20px 40px rgba(15,23,42,0.06)",
        }}>
          <div style={{
            height: 220,
            borderRadius: 16,
            background: "linear-gradient(180deg,#f3e8ff 0%, #fee2e2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 64 }}>🧘‍♀️</div>
              <div style={{ fontSize: 40, marginTop: 8 }}>🌸</div>
            </div>
          </div>

          <h1 style={{ textAlign: "center", color: "#7c2cff" }}>It's Ok Not To Be OKAY!!</h1>
          <p style={{ textAlign: "center", color: "#6b7280", marginTop: 6 }}>MindGuardian helps you notice stress early and gently feel better.</p>

          <div style={{ marginTop: 18 }}>
            <input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", marginBottom: "0.75rem", padding: 12 }}
            />

            <input
              placeholder="Age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              style={{ width: "100%", marginBottom: "1rem", padding: 12 }}
            />

            <button onClick={handleContinue} style={{ width: "100%", padding: 12, borderRadius: 28, fontSize: 16, background: "linear-gradient(90deg,#7c3aed,#ec4899)" }}>
              Let Us Help You
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
