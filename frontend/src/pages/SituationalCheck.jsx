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
  const { user, setUser } = useContext(UserContext);
  const [index, setIndex] = useState(0);

  const question = QUESTIONS[index];

  async function selectOption(option) {
    const energy = option.value === "drained" || option.value === "overwhelmed" || option.value === "rest" ? "low" : option.value === "work" || option.value === "easy" ? "high" : "normal";

    setUser((prev) => ({
      ...prev,
      situations: [...(prev.situations || []), option.label],
      energy,
    }));

    if (index + 1 < QUESTIONS.length) {
      setIndex(index + 1);
    } else {
      try { const { trackSituationalCheckCompleted } = await import('../services/analyticsService'); trackSituationalCheckCompleted(); } catch (e) {}
      navigate("/dashboard");
    }
  }

  const buttonStyle = {
    textAlign: 'left',
    padding: '18px 20px',
    borderRadius: 12,
    background: '#f8fafc',
    border: '1px solid #eef2ff',
    fontSize: 16,
    color: '#1f2937',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ padding: "2rem", display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 760, width: "100%" }}>
        <div style={{ background: "white", borderRadius: 16, padding: "1.5rem 2rem", boxShadow: "0 10px 30px rgba(2,6,23,0.06)" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#6b7280' }}>Question {index + 1} of {QUESTIONS.length}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {QUESTIONS.map((q, i) => (
                <div key={q.id} style={{ width: 8, height: 8, borderRadius: 8, background: i === index ? '#7c3aed' : '#e6e6e9' }} />
              ))}
            </div>
          </div>

          <h2 style={{ marginTop: 12 }}>{question.text}</h2>

          <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
            {question.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => selectOption(opt)}
                onMouseEnter={(e) => {
                  e.target.style.background = '#eef2ff';
                  e.target.style.borderColor = '#7c3aed';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f8fafc';
                  e.target.style.borderColor = '#eef2ff';
                }}
                style={buttonStyle}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 12, color: '#94a3b8' }}>No right or wrong answers</div>
        </div>
      </div>
    </div>
  );
}
