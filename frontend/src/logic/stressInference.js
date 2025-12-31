/**
 * Infers stress level in a safe, non-intrusive way.
 * Designed to handle cold-start users ethically.
 */
export function inferStress(user) {
  // Cold start: not enough information
  if (!user || !user.situations || user.situations.length < 2) {
    return "neutral";
  }

  // Low energy days → gentle elevation
  if (user.energyLevel === "low") {
    return "elevated";
  }

  // Default steady state
  return "normal";
}
