import { useContext, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Card from "../components/common/Card";

const QUESTIONS = [
  "What was one good thing that happened today?",
  "How did you feel for most of the day?",
  "What was hard or stressful?",
  "How did you handle the hard moments?",
  "What are you grateful for?",
];

const MOODS = {
  happy: ["happy", "joy", "great", "wonderful", "amazing", "excited", "fun", "proud"],
  low: ["sad", "down", "upset", "lonely", "tired", "drained", "exhausted"],
  anxious: ["anxious", "worried", "stressed", "nervous", "tense", "overwhelmed", "pressure"],
  calm: ["calm", "peaceful", "relaxed", "content", "okay", "fine"],
  grateful: ["grateful", "thankful", "appreciate", "blessed", "lucky"],
};

// A short, kind summary built on the device: it names the feelings it noticed
// and offers one next step. It doesn't repeat the answers back.
function summarise(answers) {
  const text = Object.values(answers).join(" ").toLowerCase();
  const found = Object.keys(MOODS).filter((m) => MOODS[m].some((w) => text.includes(w)));
  const lines = [];
  if (found.length) {
    const words = { happy: "bright spots", low: "some heaviness", anxious: "stress", calm: "moments of calm", grateful: "gratitude" };
    lines.push(`Today held ${found.map((f) => words[f]).join(", ").replace(/, ([^,]*)$/, " and $1")}.`);
  } else {
    lines.push("Today sounds like a mix of things, which is completely normal.");
  }
  if (answers[3]?.trim()) lines.push("You found a way through the hard parts. That's worth noticing.");
  if (found.includes("anxious") || found.includes("low")) {
    lines.push("Next step: a minute of box breathing before bed can help your body let go of the day.");
  } else if (found.includes("grateful") || found.includes("happy")) {
    lines.push("Next step: think about what made the good moments possible, and plan a little more of it tomorrow.");
  } else {
    lines.push("Next step: keep the strategies that helped and let the rest of the day go.");
  }
  return { text: lines.join(" "), moods: found, calmLink: found.includes("anxious") || found.includes("low") };
}

export default function Journal() {
  const { user, setUser } = useContext(UserContext);
  const [params, setParams] = useSearchParams();
  const mode = params.get("mode");
  const [writeText, setWriteText] = useState("");
  const [answers, setAnswers] = useState({});
  const [summary, setSummary] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  const setMode = (m) => { setSavedAt(null); setSummary(null); setParams(m ? { mode: m } : {}); };

  function save(entry) {
    setUser((prev) => ({ ...prev, journals: [...(prev.journals || []), { date: new Date().toLocaleDateString(), ...entry }] }));
    setSavedAt(new Date());
  }

  const recent = [...(user.journals || [])].reverse().slice(0, 3);

  if (mode === "write") {
    return (
      <div className="mg-page">
        <button className="mg-btn mg-btn--ghost mg-back" onClick={() => setMode(null)}>← Journal</button>
        <h1>Write freely</h1>
        <p className="mg-muted">No rules. Spelling doesn't matter. Nobody else sees this.</p>
        <textarea
          className="mg-textarea mg-textarea--tall"
          value={writeText}
          onChange={(e) => { setWriteText(e.target.value); setSavedAt(null); }}
          placeholder="Start anywhere…"
          aria-label="Journal entry"
        />
        <div className="mg-row">
          <button className="mg-btn" onClick={() => save({ mode: "write", content: writeText.trim() })} disabled={!writeText.trim() || !!savedAt}>
            {savedAt ? "Saved" : "Save entry"}
          </button>
          {savedAt && <Link to="/profile">See it in your profile</Link>}
        </div>
      </div>
    );
  }

  if (mode === "qa") {
    const answered = Object.values(answers).filter((a) => a && a.trim()).length;
    return (
      <div className="mg-page">
        <button className="mg-btn mg-btn--ghost mg-back" onClick={() => setMode(null)}>← Journal</button>
        <h1>Guided questions</h1>
        {!summary ? (
          <>
            <p className="mg-muted">Answer as many as you like. One line each is plenty.</p>
            <ol className="mg-questions">
              {QUESTIONS.map((q, i) => (
                <li key={i}>
                  <label className="mg-field">
                    <span>{q}</span>
                    <textarea className="mg-textarea" value={answers[i] || ""} onChange={(e) => setAnswers((p) => ({ ...p, [i]: e.target.value }))} />
                  </label>
                </li>
              ))}
            </ol>
            <button className="mg-btn" onClick={() => setSummary(summarise(answers))} disabled={!answered}>
              See my summary
            </button>
          </>
        ) : (
          <>
            <Card className="mg-summary">
              <p style={{ margin: 0 }}>{summary.text}</p>
              {summary.calmLink && <p style={{ marginBottom: 0 }}><Link to="/activities?game=breathing">Start box breathing</Link></p>}
            </Card>
            <div className="mg-row">
              <button
                className="mg-btn"
                disabled={!!savedAt}
                onClick={() => save({ mode: "qa", content: JSON.stringify(answers), summary: summary.text, moods: summary.moods })}
              >
                {savedAt ? "Saved" : "Save entry"}
              </button>
              <button className="mg-btn mg-btn--ghost" onClick={() => setSummary(null)}>Edit answers</button>
              {savedAt && <Link to="/profile">See it in your profile</Link>}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mg-page">
      <header className="mg-page__head">
        <h1>Journal</h1>
        <p className="mg-muted">Putting a feeling into words makes it smaller.</p>
      </header>
      <div className="mg-tiles mg-tiles--two">
        <Card onClick={() => setMode("write")} className="mg-tile">
          <div className="mg-tile__title">Write freely</div>
          <div className="mg-muted">A blank page for whatever's on your mind</div>
        </Card>
        <Card onClick={() => setMode("qa")} className="mg-tile">
          <div className="mg-tile__title">Guided questions</div>
          <div className="mg-muted">Five prompts, with a short summary at the end</div>
        </Card>
      </div>

      {recent.length > 0 && (
        <>
          <h2 className="mg-section-title">Recent entries</h2>
          <ul className="mg-entries">
            {recent.map((j, i) => (
              <li key={i} className="mg-card">
                <div className="mg-muted">{j.date}</div>
                <div className="mg-entry__text">{j.summary || j.content}</div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
