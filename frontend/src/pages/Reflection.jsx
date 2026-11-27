import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { analyzeTextTone, extractStressKeywords } from "../services/mlkitService";

export default function Reflection() {
  const { user, setUser } = useContext(UserContext);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [hint, setHint] = useState("");

  function readTone() {
    const tone = analyzeTextTone(text || "");
    const kws = extractStressKeywords(text || "");
    const toneWords = { calm: "calm and settled", tense: "a bit tense", neutral: "fairly even" };
    let msg = `Your words read as ${toneWords[tone.tone] || tone.tone}.`;
    if (kws?.length) msg += ` You mentioned ${kws.slice(0, 3).join(", ")}; it might help to name one small thing you can do about it tomorrow.`;
    setHint(msg);
  }

  function save() {
    const entry = { date: new Date().toLocaleDateString(), text: text.trim(), energy: user.energy };
    setUser((p) => ({ ...p, reflections: [...(p.reflections || []), entry] }));
    setSaved(true);
  }

  return (
    <div className="mg-page">
      <header className="mg-page__head">
        <h1>End of the day</h1>
        <p className="mg-muted">What do you want to put down before you sleep? A sentence is enough.</p>
      </header>

      <textarea
        className="mg-textarea mg-textarea--tall"
        value={text}
        onChange={(e) => { setText(e.target.value); setSaved(false); setHint(""); }}
        placeholder="Today I…"
        aria-label="Reflection"
      />

      <div className="mg-row">
        <button className="mg-btn" onClick={save} disabled={!text.trim() || saved}>{saved ? "Saved" : "Save reflection"}</button>
        <button className="mg-btn mg-btn--ghost" onClick={readTone} disabled={!text.trim()}>How does it sound?</button>
        {saved && <Link to="/dashboard">Back to Home</Link>}
      </div>
      {hint && <p className="mg-card mg-summary" aria-live="polite">{hint}</p>}
    </div>
  );
}
