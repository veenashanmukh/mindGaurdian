// mlkitService.js
// Abstraction placeholder for Google ML Kit (on-device ML for mobile platforms)
// Currently implements heuristic, client-side JS helper functions as a stop-gap.
// NOTE: In a future native mobile build, replace these implementations with
// calls to Google ML Kit on-device APIs (Android / iOS) to perform real
// tone analysis and keyword extraction. This file's API surface is designed
// so it can be swapped with native/bridged implementations later.

// Privacy-first: all processing is local, no network calls, no external deps.

// analyzeTextTone(text) -> { tone: 'calm'|'neutral'|'tense', score: 0..1 }
export function analyzeTextTone(text = "") {
  const t = (text || "").toLowerCase();
  if (!t.trim()) return { tone: "neutral", score: 0 };

  // simple heuristics: presence of anxiety/anger words increases tension score
  const tenseWords = ["anxious", "anxiety", "stressed", "stressed", "angry", "upset", "worried", "tense", "panic", "overwhelmed", "depressed"];
  const calmWords = ["calm", "relaxed", "peace", "grateful", "happy", "content", "okay", "fine"];

  let score = 0.5; // neutral baseline
  tenseWords.forEach((w) => { if (t.includes(w)) score += 0.12; });
  calmWords.forEach((w) => { if (t.includes(w)) score -= 0.12; });

  // clamp
  if (score < 0) score = 0;
  if (score > 1) score = 1;

  let tone = "neutral";
  if (score > 0.65) tone = "tense";
  else if (score < 0.35) tone = "calm";

  return { tone, score };
}

// extractStressKeywords(text) -> [keywords]
export function extractStressKeywords(text = "") {
  const t = (text || "").toLowerCase();
  const keywords = ["deadline", "pressure", "overwhelmed", "panic", "anxious", "stress", "sick", "tired", "sleep", "insomnia", "angry", "fight", "argument"];
  const found = [];
  keywords.forEach((k) => {
    if (t.includes(k)) found.push(k);
  });
  return found;
}

// Future: replace above heuristics with ML Kit calls when building native app.
// Exported API remains the same to make swapping implementations straightforward.
