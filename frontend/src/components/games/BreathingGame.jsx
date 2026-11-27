import { useEffect, useState } from "react";

function BreathingGame({ onClose }) {
  const [phase, setPhase] = useState("inhale");

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) =>
        prev === "inhale" ? "hold" : prev === "hold" ? "exhale" : "inhale"
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const text =
    phase === "inhale"
      ? "Inhale slowly"
      : phase === "hold"
      ? "Hold"
      : "Exhale gently";

  return (
    <div style={overlay}>
      <div style={card}>
        <h2>Breathing Reset</h2>
        <div
          style={{
            ...circle,
            transform:
              phase === "inhale"
                ? "scale(1.2)"
                : phase === "exhale"
                ? "scale(0.8)"
                : "scale(1)",
          }}
        />
        <p>{text}</p>
        <button onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

export default BreathingGame;

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const card = {
  background: "#fff",
  padding: "2rem",
  borderRadius: "12px",
  textAlign: "center",
  width: "300px",
};

const circle = {
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  background: "#c7d2fe",
  margin: "1rem auto",
  transition: "transform 3s ease-in-out",
};
