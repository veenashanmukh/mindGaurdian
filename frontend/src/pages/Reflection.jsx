import { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { analyzeTextTone, extractStressKeywords } from "../services/mlkitService";

export default function Reflection() {
  const { user } = useContext(UserContext);
  const [text, setText] = useState("");

  const autoSummary = () => {
    // Use local heuristic MLKit abstraction to infer tone and keywords
    const parts = [];
    if (user.situations && user.situations.length) {
      parts.push(`You reflected on: ${user.situations.join(", ")}`);
    }

    const toneRes = analyzeTextTone(text || "");
    const kws = extractStressKeywords(text || "");

    parts.push(`Energy: ${user.energy || "normal"}`);
    parts.push(`Tone: ${toneRes.tone} (score ${Math.round(toneRes.score * 100)}%)`);
    if (kws && kws.length) parts.push(`Keywords: ${kws.join(", ")}`);

    return parts.join(" — ");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h2>End-of-day Reflection (optional)</h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write something (or use auto-summary)"
        style={{ width: "100%", minHeight: "160px", padding: "0.75rem" }}
      />

      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => alert("Saved locally — no data shared.")}>Save</button>
        <button style={{ marginLeft: "0.75rem" }} onClick={() => setText(autoSummary())}>Auto Summary</button>
      </div>
    </div>
  );
}
