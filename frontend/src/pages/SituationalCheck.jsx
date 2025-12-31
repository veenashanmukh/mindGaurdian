import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function SituationalCheck() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleSelect = (option) => {
    setUser((prev) => ({
      ...prev,
      situations: [...prev.situations, option],
      energyLevel:
        option === "overwhelmed" || option === "exhausted"
          ? "low"
          : "normal",
    }));

    navigate("/dashboard");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Situational Check-In</h2>

      <p>
        Choose the option that feels closest to how your day is going.
        No labels. No pressure.
      </p>

      <div style={{ marginTop: "1.5rem" }}>
        <button
          onClick={() => handleSelect("steady")}
          style={{ width: "100%", padding: "0.8rem", marginBottom: "0.8rem" }}
        >
          The day feels manageable
        </button>

        <button
          onClick={() => handleSelect("overwhelmed")}
          style={{ width: "100%", padding: "0.8rem", marginBottom: "0.8rem" }}
        >
          A lot is happening and it feels heavy
        </button>

        <button
          onClick={() => handleSelect("exhausted")}
          style={{ width: "100%", padding: "0.8rem", marginBottom: "0.8rem" }}
        >
          My energy feels low today
        </button>

        <button
          onClick={() => handleSelect("focused")}
          style={{ width: "100%", padding: "0.8rem" }}
        >
          I feel focused and want to stay on track
        </button>
      </div>
    </div>
  );
}
