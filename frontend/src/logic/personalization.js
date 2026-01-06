export function personalizeSuggestions(energy) {
  if (energy === "low") {
    return [
      "2-minute breathing exercise",
      "Gentle music",
      "Do nothing for 5 minutes",
    ];
  }

  if (energy === "high") {
    return [
      "Focus session",
      "Protect your momentum",
      "Avoid distractions",
    ];
  }

  return [
    "Short walk",
    "Light reflection",
    "Calming game",
  ];
}
