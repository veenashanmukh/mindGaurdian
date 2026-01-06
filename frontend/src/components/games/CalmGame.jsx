import { useState } from "react";

export default function CalmGame({ onClose }) {
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Click circles to calm your mind");

  const handleClick = () => {
    setScore((s) => s + 1);
    if (score + 1 >= 5) {
      setMessage("Great! You earned some calm. 🧘");
    }
  };

  return (
    <div style={overlay}>
      <div style={card}>
        <h2>Calm Tapping Game</h2>
        <p>{message}</p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.5rem" }}>
          {[1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={handleClick}
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                border: "none",
                background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                color: "white",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              💧
            </button>
          ))}
        </div>

        <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "#666" }}>Score: {score}</p>
        <button
          onClick={onClose}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            background: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
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
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const card = {
  background: "white",
  padding: "2rem",
  borderRadius: "16px",
  textAlign: "center",
  maxWidth: "350px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
};
