import { useEffect, useState } from "react";
import { addCoins } from "../../utils/rewards";
import { updateStreak } from "../../utils/streak";

export default function BreathingGame({ onClose }) {
  const [phase, setPhase] = useState("Inhale");
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes

  useEffect(() => {
    const phaseTimer = setInterval(() => {
      setPhase((p) =>
        p === "Inhale" ? "Hold" : p === "Hold" ? "Exhale" : "Inhale"
      );
    }, 3000);

    const countdown = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(phaseTimer);
      clearInterval(countdown);
    };
  }, []);

  return (
    <div style={overlay}>
      <div style={card}>
        <h2 style={{ marginBottom: 10 }}>Breathing Bubble</h2>

        <div
          style={{
            ...bubble,
            transform: phase === "Inhale" ? "scale(1.3)" : "scale(0.8)",
          }}
        />

        <h3 style={{ color: "#111", margin: 10 }}>{phase}</h3>
        <p style={{ fontSize: 14, color: "#444" }}>
          Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </p>

        {timeLeft === 0 && (
          <p style={{ color: "#5DB075", marginTop: 10 }}>
            Session Complete 🌿
          </p>
        )}

        <button
          style={btn}
          onClick={() => {
            addCoins(5);
            updateStreak();
            onClose();
          }}
        >
          Finish
        </button>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background:
    "radial-gradient(circle at top, #2e4057 0%, #0f1c2d 60%, #020b16 100%)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  animation: "slideUp .4s ease",
};

const card = {
  background: "rgba(255,255,255,0.95)",
  padding: 34,
  borderRadius: 30,
  textAlign: "center",
  width: 320,
  boxShadow: "0 40px 80px rgba(0,0,0,.55)",
  backdropFilter: "blur(8px)",
};

const bubble = {
  width: 140,
  height: 140,
  borderRadius: "50%",
  background:
    "radial-gradient(circle at 30% 30%, #b6f3d1, #5DB075)",
  margin: "24px auto",
  transition: "all 3s ease",
  boxShadow: "0 0 60px rgba(93,176,117,.9)",
};

const btn = {
  padding: "14px 20px",
  borderRadius: 18,
  border: "none",
  background: "linear-gradient(135deg,#5DB075,#8fd9a8)",
  color: "#fff",
  marginTop: 14,
  cursor: "pointer",
  fontWeight: 600,
};
