import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const QUESTIONS = [
  {
    id: 1,
    text: "You have a lot to do and very little time today. What do you usually do?",
    options: [
      { label: "Push through and ignore it", value: "push" },
      { label: "Get irritated", value: "irritated" },
      { label: "Pause for a moment", value: "pause" },
      { label: "Feel overwhelmed", value: "overwhelmed" },
    ],
  },
  {
    id: 2,
    text: "When you notice stress building, which is closest to your response?",
    options: [
      { label: "Distract myself", value: "distract" },
      { label: "Take a break", value: "break" },
      { label: "Ask for help", value: "help" },
      { label: "Keep working harder", value: "work" },
    ],
  },
  {
    id: 3,
    text: "How do you prefer to calm down when energy is low?",
    options: [
      { label: "Short breathing", value: "breath" },
      { label: "Mindful walk", value: "walk" },
      { label: "Listen to calm music", value: "music" },
      { label: "Rest for few minutes", value: "rest" },
    ],
  },
  {
    id: 4,
    text: "When decisions pile up, what helps you most?",
    options: [
      { label: "Write a quick list", value: "list" },
      { label: "Do the easiest thing", value: "easy" },
      { label: "Defer decisions", value: "defer" },
      { label: "Ask a friend", value: "friend" },
    ],
  },
  {
    id: 5,
    text: "At the end of a heavy day, which is most likely?",
    options: [
      { label: "I feel drained", value: "drained" },
      { label: "I feel relieved", value: "relieved" },
      { label: "I reflect briefly", value: "reflect" },
      { label: "I distract with screens", value: "screens" },
    ],
  },
];

export default function SituationalCheck() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [index, setIndex] = useState(0);

  const question = QUESTIONS[index];

  async function selectOption(option) {
    const energy = option.value === "drained" || option.value === "overwhelmed" || option.value === "rest" ? "low" : option.value === "work" || option.value === "easy" ? "high" : "normal";

    setUser((prev) => ({
      ...prev,
      situations: [...(prev.situations || []), option.label].slice(-30),
      energy,
      checkIns: index + 1 === QUESTIONS.length
        ? [...(prev.checkIns || []), { kind: "quiz", value: energy, date: new Date().toISOString() }]
        : prev.checkIns || [],
    }));

    if (index + 1 < QUESTIONS.length) {
      setIndex(index + 1);
    } else {
      try { const { trackSituationalCheckCompleted } = await import('../services/analyticsService'); trackSituationalCheckCompleted(); } catch { /* analytics optional */ }
      navigate("/dashboard");
    }
  }

  return (
    <div className="mg-page">
      <div className="mg-quiz">
        <div className="mg-quiz__top">
          {index > 0 ? (
            <button className="mg-btn mg-btn--ghost" onClick={() => setIndex(index - 1)}>← Back</button>
          ) : (
            <span className="mg-muted">No right or wrong answers</span>
          )}
          <span className="mg-muted">{index + 1} of {QUESTIONS.length}</span>
        </div>
        <div className="mg-progress" aria-hidden="true">
          <div className="mg-progress__fill" style={{ width: `${(index / QUESTIONS.length) * 100}%` }} />
        </div>

        <h1 className="mg-quiz__q">{question.text}</h1>

        <div className="mg-options">
          {question.options.map((opt) => (
            <button key={opt.value} className="mg-option" onClick={() => selectOption(opt)}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
