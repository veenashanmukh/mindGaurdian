import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

export default function DailyCheckIn() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const quickPick = (energy) => {
    setUser((prev) => ({ ...prev, energy }));
    navigate("/dashboard");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Daily Check-in (quick)</h2>
      <p>Pick what feels closest to your energy right now.</p>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button onClick={() => quickPick("low")}>Low energy</button>
        <button onClick={() => quickPick("normal")}>Normal</button>
        <button onClick={() => quickPick("high")}>High</button>
      </div>

      <p style={{ marginTop: "1.5rem", color: "#666" }}>
        This is optional — the app adapts gently based on your choice.
      </p>
    </div>
  );
}
