 import { getPattern } from "../ai/dayMemory";   // ← add this at TOP of file

const pattern = getPattern();
export default function NightReflection({ onClose }) {
  const mood = localStorage.getItem("userMood") || "Okay";

  const reflectionMap = {
    Calm: "Tomorrow, try doing one small thing just for yourself 🌿",
    Okay: "A short pause tomorrow could help you stay balanced ☁️",
    Tired: "Go easy tomorrow. Even a 2-minute rest matters 💛",
    Stressed: "Take one slow breath tomorrow before your busy moments 🌙",
  };
 

if (pattern === "STRESS_PATTERN") {
  reflectionMap.Stressed =
    "You’ve had a few heavy days lately. Tomorrow, protect your energy 🌿";
}


  return (
    <div style={overlay}>
      <div style={card}>
        <h2>Your Day in Review 🌙</h2>
        <p style={message}>{reflectionMap[mood]}</p>
        <button style={btn} onClick={onClose}>
          Close
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
  padding: 30,
  width: 320,
  textAlign: "center",
};

const message = {
  margin: "16px 0",
  fontSize: 16,
  color: "#333",
};

const btn = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "#5DB075",
  border: "none",
  color: "#fff",
};
