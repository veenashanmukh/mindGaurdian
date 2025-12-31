/**
 * Returns suggestions based on user situations.
 * Designed to stay minimal and non-overwhelming.
 */
export function personalizeSuggestions(situations = []) {
  if (!situations || situations.length === 0) {
    return ["breathing"];
  }

  if (situations.includes("overwhelmed") || situations.includes("exhausted")) {
    return ["breathing"];
  }

  if (situations.includes("focused")) {
    return ["pause", "calm-audio"];
  }

  return ["pause"];
}
