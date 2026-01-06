import { useState } from "react";
import Card from "../common/Card";

// ============================================================
// 5-4-3-2-1 Grounding Technique Game
// ============================================================
// Purpose: Helps users engage 5 senses to reduce anxiety
// How it works: Guide through observing 5 things they see,
//              4 things they can touch, 3 things they hear, etc.
// Research: Grounding/sensory focus reduces panic & dissociation
// ============================================================

export default function GroundingGame() {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [completed, setCompleted] = useState(false);

  const steps = [
    { sense: "👀 See", count: 5, prompt: "Name 5 things you can SEE right now" },
    { sense: "🤚 Touch", count: 4, prompt: "Name 4 things you can TOUCH" },
    { sense: "👂 Hear", count: 3, prompt: "Name 3 things you can HEAR" },
    { sense: "👃 Smell", count: 2, prompt: "Name 2 things you can SMELL" },
    { sense: "👅 Taste", count: 1, prompt: "Name 1 thing you can TASTE" },
  ];

  const currentStep = steps[step];

  const handleAddItem = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const key = `step_${step}`;
      const items = responses[key] || [];
      if (items.length < currentStep.count) {
        setResponses({ ...responses, [key]: [...items, e.target.value.trim()] });
        e.target.value = "";
      }
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleReset = () => {
    setStep(0);
    setResponses({});
    setCompleted(false);
  };

  if (completed) {
    return (
      <Card style={{ padding: "2rem", textAlign: "center" }}>
        <h2>✅ Grounding Complete!</h2>
        <p>You've reconnected with your senses. Take a deep breath.</p>
        <button onClick={handleReset} style={{ marginTop: "1rem", padding: "10px 20px" }}>
          Try Again
        </button>
      </Card>
    );
  }

  const currentItems = responses[`step_${step}`] || [];

  return (
    <Card style={{ padding: "2rem" }}>
      <h2>{currentStep.sense}</h2>
      <p style={{ color: "#6b7280" }}>{currentStep.prompt}</p>

      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder={`Add item (${currentItems.length}/${currentStep.count})`}
          onKeyPress={handleAddItem}
          disabled={currentItems.length >= currentStep.count}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: 14,
          }}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.5rem" }}>
        {currentItems.map((item, i) => (
          <div
            key={i}
            style={{
              background: "#f0fdf4",
              padding: "8px 12px",
              borderRadius: 20,
              fontSize: 13,
              color: "#10b981",
            }}
          >
            ✓ {item}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          style={{ flex: 1, opacity: step === 0 ? 0.5 : 1 }}
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={currentItems.length < currentStep.count}
          style={{ flex: 1, opacity: currentItems.length < currentStep.count ? 0.5 : 1 }}
        >
          Next →
        </button>
      </div>
    </Card>
  );
}
