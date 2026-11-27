// Simple, deterministic wellness inference
// No AI, no dataset, hackathon-safe

export function inferWellnessScore(user) {
  let score = 80;

  if (!user) return score;

  if (user.energy === "low") score -= 25;
  if (user.energy === "high") score += 5;

  if (user.situations?.includes("overwhelmed")) score -= 20;
  if (user.situations?.includes("exhausted")) score -= 25;

  return Math.max(30, Math.min(score, 95));
}
