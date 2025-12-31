import { addCoins } from "../../utils/rewards";
import { updateStreak } from "../../utils/streak";

export default function FocusBooster({ onClose }) {
  return (
    <div style={overlay}>
      <div style={card}>
        <h2 style={{ marginBottom: 12 }}>Focus Reset 🎯</h2>

        <p style={{ color: "#444", marginBottom: 16 }}>
          Take 2 minutes to clear your head and reset your attention.
        </p>

        <div style={steps}>
          <div>👁 Look away from your screen</div>
          <div>🫁 Take 3 slow breaths</div>
          <div>🧘 Relax your shoulders</div>
          <div>📝 Decide your next one task</div>
        </div>

        <button
          style={btn}
          onClick={() => {
            addCoins(5);
            updateStreak();
            onClose();
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  animation: "slideUp .4s ease",
};

const card = {
  background: "#fff",
  borderRadius: 24,
  padding: 28,
  width: 320,
  textAlign: "center",
};

const steps = {
  textAlign: "left",
  marginBottom: 20,
  lineHeight: "1.8",
  color: "#333",
};

const btn = {
  padding: 12,
  borderRadius: 12,
  background: "#5DB075",
  border: "none",
  color: "#fff",
  width: "100%",
  fontSize: 14,
};
