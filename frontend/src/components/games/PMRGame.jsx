import { useState } from "react";
import Card from "../common/Card";

// ============================================================
// Progressive Muscle Relaxation (PMR) Game
// ============================================================
// Purpose: Reduce physical tension by systematically tensing
//          and relaxing muscle groups
// How it works: Guide through 10 body areas, tense for 5sec,
//              release, notice the difference
// Research: PMR reduces anxiety, improves sleep, lowers cortisol
// ============================================================

export default function PMRGame() {
  const [step, setStep] = useState(0);
  const [isReleasing, setIsReleasing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const muscleGroups = [
    { name: "Fists", emoji: "✊", instruction: "Clench both fists tightly" },
    { name: "Forearms", emoji: "💪", instruction: "Tense forearms by bending elbows" },
    { name: "Upper arms", emoji: "🦾", instruction: "Tighten upper arms (like making a muscle)" },
    { name: "Shoulders", emoji: "🤷", instruction: "Raise shoulders up to ears and tense" },
    { name: "Face", emoji: "😖", instruction: "Scrunch face (eyes, nose, mouth tight)" },
    { name: "Neck", emoji: "🧠", instruction: "Push chin forward to tense neck muscles" },
    { name: "Chest", emoji: "🫀", instruction: "Take deep breath and tense chest muscles" },
    { name: "Abdomen", emoji: "🫘", instruction: "Tighten stomach muscles" },
    { name: "Thighs", emoji: "🦵", instruction: "Squeeze thigh muscles tightly" },
    { name: "Calves & feet", emoji: "🦶", instruction: "Point toes and tense calves" },
  ];

  const current = muscleGroups[step];

  const handleTense = () => {
    setIsReleasing(true);
    setTimeout(() => setIsReleasing(false), 500);
  };

  const handleNext = () => {
    if (step < muscleGroups.length - 1) {
      setStep(step + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleReset = () => {
    setStep(0);
    setIsReleasing(false);
    setCompleted(false);
  };

  if (completed) {
    return (
      <Card style={{ padding: "2rem", textAlign: "center" }}>
        <h2>✅ Relaxation Complete!</h2>
        <p>Your muscles are now relaxed. Notice how your body feels.</p>
        <button onClick={handleReset} style={{ marginTop: "1rem", padding: "10px 20px" }}>
          Try Again
        </button>
      </Card>
    );
  }

  return (
    <Card style={{ padding: "2rem" }}>
      <h2 style={{ marginTop: 0 }}>Progressive Muscle Relaxation</h2>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 48, marginBottom: "0.5rem" }}>{current.emoji}</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{current.name}</div>
        <div style={{ color: "#6b7280", marginTop: "0.5rem" }}>{current.instruction}</div>
      </div>

      <div
        style={{
          background: isReleasing ? "#dbeafe" : "#fef2f2",
          padding: "1.5rem",
          borderRadius: 12,
          textAlign: "center",
          marginBottom: "1.5rem",
          transition: "background 0.3s",
        }}
      >
        <div style={{ fontSize: 14, color: "#6b7280" }}>
          {isReleasing
            ? "💫 RELEASE — let all tension melt away (feel the difference)"
            : "⏱️ Ready to tense for 5 seconds?"}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          style={{ flex: 1, opacity: step === 0 ? 0.5 : 1 }}
        >
          ← Back
        </button>
        <button
          onClick={handleTense}
          style={{
            flex: 2,
            padding: "12px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          🔴 Tense & Release
        </button>
        <button
          onClick={handleNext}
          style={{ flex: 1 }}
        >
          Next →
        </button>
      </div>

      <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
        {step + 1} of {muscleGroups.length}
      </div>
    </Card>
  );
}
