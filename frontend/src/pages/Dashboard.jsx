import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { inferStress } from "../logic/stressInference";
import { personalizeSuggestions } from "../logic/personalization";

export default function Dashboard() {
  const { user } = useContext(UserContext);

  const stressLevel = inferStress(user);
  const suggestions = personalizeSuggestions(user.situations);
  const isLowEnergy = user.energyLevel === "low";

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Hello {user.name || "there"} 👋</h2>

      {/* Status message */}
      <div style={{ marginTop: "1rem" }}>
        {stressLevel === "neutral" && (
          <p>
            Today looks steady. No pressure — just take things at your own pace.
          </p>
        )}

        {stressLevel === "elevated" && (
          <p>
            Today might feel a bit heavy. A small reset could help.
          </p>
        )}

        {stressLevel === "normal" && (
          <p>
            You seem balanced right now. Let’s keep it that way.
          </p>
        )}
      </div>

      {/* Suggestions */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Suggested for you</h3>

        {suggestions.includes("breathing") && (
          <div style={{ marginTop: "1rem" }}>
            <button
              style={{ padding: "0.8rem", width: "100%" }}
              onClick={() => alert("Breathing exercise coming next")}
            >
              🌬 2-minute breathing reset
            </button>
          </div>
        )}

        {!isLowEnergy && suggestions.includes("pause") && (
          <div style={{ marginTop: "1rem" }}>
            <button
              style={{ padding: "0.8rem", width: "100%" }}
              onClick={() => alert("Pause suggestion")}
            >
              ☕ Take a short pause
            </button>
          </div>
        )}

        {!isLowEnergy && suggestions.includes("calm-audio") && (
          <div style={{ marginTop: "1rem" }}>
            <button
              style={{ padding: "0.8rem", width: "100%" }}
              onClick={() => alert("Calm audio")}
            >
              🎵 Play calm background sound
            </button>
          </div>
        )}
      </div>

      {/* Low energy guard */}
      {isLowEnergy && (
        <p style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#555" }}>
          We’re keeping things light today. No need to do more than this.
        </p>
      )}
    </div>
  );
}
