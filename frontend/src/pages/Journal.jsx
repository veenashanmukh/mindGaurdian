import { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import Card from "../components/common/Card";

const JOURNAL_QUESTIONS = [
  "What was one good thing that happened today?",
  "How did you feel most of the day? What emotions came up?",
  "What was challenging or stressful today?",
  "How did you handle stress or difficult moments?",
  "What are you grateful for today?",
];

export default function Journal() {
  const { user, setUser } = useContext(UserContext);
  const [mode, setMode] = useState(null); // 'write' or 'qa'
  const [writeText, setWriteText] = useState("");
  const [qaAnswers, setQaAnswers] = useState({});
  const [summary, setSummary] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");

  // Simple AI summary generator using rule-based logic
  function generateAISummary() {
    const answers = Object.values(qaAnswers).filter((a) => a.trim());
    if (!answers.length) {
      alert("Please answer at least one question.");
      return;
    }

    const emotionKeywords = {
      happy: ["happy", "joy", "great", "wonderful", "amazing", "excited"],
      sad: ["sad", "down", "upset", "depressed", "lonely"],
      anxious: ["anxious", "worried", "stressed", "nervous", "tense"],
      calm: ["calm", "peaceful", "relaxed", "content"],
      grateful: ["grateful", "thankful", "appreciate", "blessed"],
    };

    let detectedEmotions = [];
    answers.forEach((answer) => {
      const lower = answer.toLowerCase();
      Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
        if (keywords.some((kw) => lower.includes(kw))) {
          if (!detectedEmotions.includes(emotion)) {
            detectedEmotions.push(emotion);
          }
        }
      });
    });

    // Build summary
    let summaryText = "📝 **AI-Generated Journal Summary**\n\n";
    
    if (detectedEmotions.length > 0) {
      summaryText += `**Emotions Detected:** ${detectedEmotions.join(", ")}\n\n`;
    }

    answers.forEach((answer, idx) => {
      const q = JOURNAL_QUESTIONS[idx];
      if (answer.trim()) {
        summaryText += `**Q${idx + 1}:** ${q}\n`;
        summaryText += `**A:** ${answer.substring(0, 100)}${answer.length > 100 ? "..." : ""}\n\n`;
      }
    });

    // Add personalized insight
    if (detectedEmotions.includes("grateful")) {
      summaryText += "\n✨ **Insight:** You showed gratitude today. Keep building on positive moments.\n";
    }
    if (detectedEmotions.includes("anxious")) {
      summaryText += "\n✨ **Insight:** You experienced stress. Consider using a breathing exercise or mindfulness game to decompress.\n";
    }
    if (detectedEmotions.includes("happy")) {
      summaryText += "\n✨ **Insight:** You had positive moments today! Celebrate these wins.\n";
    }

    setSummary(summaryText);
  }

  function handleQAChange(index, value) {
    setQaAnswers((prev) => ({ ...prev, [index]: value }));
  }

  function saveJournal() {
    const journalEntry = {
      date: new Date().toLocaleDateString(),
      mode: mode,
      content: mode === "write" ? writeText : JSON.stringify(qaAnswers),
      summary: summary,
    };

    // Save to user context
    setUser((prev) => ({
      ...prev,
      journals: [...(prev.journals || []), journalEntry],
    }));

    setSavedMessage("✅ Journal saved to your profile!");
    setTimeout(() => setSavedMessage(""), 3000);
  }

  // Mode selection
  if (!mode) {
    return (
      <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
        <h2>📔 Journal</h2>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
          Reflect on your day and capture your thoughts and feelings.
        </p>

        <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
          <Card onClick={() => setMode("write")} style={{ cursor: "pointer", padding: "1.5rem" }}>
            <h3 style={{ marginTop: 0 }}>✍️ Write Freely</h3>
            <p>Write whatever is on your mind without prompts.</p>
          </Card>

          <Card onClick={() => setMode("qa")} style={{ cursor: "pointer", padding: "1.5rem" }}>
            <h3 style={{ marginTop: 0 }}>❓ Guided Q&A</h3>
            <p>Answer 5 reflective questions and get an AI-generated summary.</p>
          </Card>
        </div>
      </div>
    );
  }

  // Free writing mode
  if (mode === "write") {
    return (
      <div style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
        <button
          onClick={() => {
            setMode(null);
            setWriteText("");
          }}
          style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}
        >
          ← Back
        </button>

        <h2>✍️ Free Writing</h2>
        <p style={{ color: "#6b7280" }}>Write your thoughts and feelings freely.</p>

        <textarea
          value={writeText}
          onChange={(e) => setWriteText(e.target.value)}
          placeholder="Start writing..."
          style={{
            width: "100%",
            minHeight: "300px",
            padding: "1rem",
            borderRadius: "0.5rem",
            border: "1px solid #d1d5db",
            fontFamily: "inherit",
            marginBottom: "1rem",
          }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveJournal} disabled={!writeText.trim()}>
            💾 Save Journal
          </button>
          <button
            onClick={() => setWriteText("")}
            style={{ background: "#f3f4f6", color: "#374151" }}
          >
            Clear
          </button>
        </div>

        {savedMessage && (
          <div style={{ marginTop: "1rem", color: "#10b981", fontWeight: "bold" }}>
            {savedMessage}
          </div>
        )}
      </div>
    );
  }

  // Q&A mode
  if (mode === "qa") {
    return (
      <div style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
        <button
          onClick={() => {
            setMode(null);
            setQaAnswers({});
            setSummary(null);
          }}
          style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}
        >
          ← Back
        </button>

        <h2>❓ Guided Reflection</h2>

        {!summary ? (
          <>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
              Answer these 5 questions about your day. Your answers will be analyzed
              to create a personalized summary.
            </p>

            {JOURNAL_QUESTIONS.map((question, idx) => (
              <Card key={idx} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Q{idx + 1}. {question}
                </label>
                <textarea
                  value={qaAnswers[idx] || ""}
                  onChange={(e) => handleQAChange(idx, e.target.value)}
                  placeholder="Your answer..."
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #d1d5db",
                    fontFamily: "inherit",
                  }}
                />
              </Card>
            ))}

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={generateAISummary}>🤖 Generate AI Summary</button>
              <button
                onClick={() => setQaAnswers({})}
                style={{ background: "#f3f4f6", color: "#374151" }}
              >
                Clear All
              </button>
            </div>
          </>
        ) : (
          <>
            <Card style={{ padding: "1.5rem", background: "#f0fdf4", borderLeft: "4px solid #10b981" }}>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                {summary}
              </div>
            </Card>

            <div style={{ display: "flex", gap: 8, marginTop: "1.5rem" }}>
              <button onClick={saveJournal}>💾 Save Journal with Summary</button>
              <button
                onClick={() => setSummary(null)}
                style={{ background: "#f3f4f6", color: "#374151" }}
              >
                Regenerate
              </button>
            </div>

            {savedMessage && (
              <div style={{ marginTop: "1rem", color: "#10b981", fontWeight: "bold" }}>
                {savedMessage}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}
