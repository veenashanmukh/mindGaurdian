import { useState } from "react";
import { addCoins } from "../utils/rewards";
import { updateStreak } from "../utils/streak";

export default function GratitudeGarden({ onClose }) {
  const [plants, setPlants] = useState(
    JSON.parse(localStorage.getItem("plants") || "[]")
  );
  const [text, setText] = useState("");

  const plant = () => {
    if (!text) return;
    const updated = [...plants, text];
    setPlants(updated);
    localStorage.setItem("plants", JSON.stringify(updated));
    setText("");
    addCoins(5);
    updateStreak();
  };

  return (
    <div style={overlay}>
      <div style={card}>
       <h2>Plant Today’s Calm 🌱</h2>
<p style={{ color: "#666", fontSize: 13 }}>
  One small good moment is enough.
</p>


        <input
          placeholder="What made today a little easier?"

          value={text}
          onChange={(e) => setText(e.target.value)}
          style={input}
        />

        <button style={btn} onClick={plant}>Plant Calm</button>
<p style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
  Each plant gently trains your mind to relax.
</p>

        <div style={garden}>
          {plants.map((p, i) => (
            <span key={i} style={flower}>🌼</span>
          ))}
        </div>

        <button style={closeBtn} onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.65)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  animation: "slideUp .4s ease",
};

const card = {
  background: "#fff",
  borderRadius: 28,
  padding: 30,
  width: 320,
  textAlign: "center",
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "1px solid #ddd",
  margin: "12px 0",
};

const btn = {
  width: "100%",
  padding: 12,
  borderRadius: 14,
  background: "#5DB075",
  border: "none",
  color: "#fff",
};

const closeBtn = {
  marginTop: 10,
  background: "none",
  border: "none",
  color: "#5DB075",
};

const garden = {
  marginTop: 16,
  fontSize: 24,
};

const flower = { margin: 6 };
