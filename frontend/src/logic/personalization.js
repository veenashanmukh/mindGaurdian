// Suggestions adapt to the energy level from the check-ins.
// Each one says where it takes you, so the "Start" button can open it.
export function personalizeSuggestions(energy) {
  if (energy === "low") {
    return [
      { label: "2-minute breathing exercise", detail: "Slow your breath to settle your body", to: "/activities?game=breathing" },
      { label: "Gentle rain sounds", detail: "Let something soft play in the background", to: "/music?track=rain" },
      { label: "Do nothing for 5 minutes", detail: "A quiet timer, nothing to achieve", to: "/activities?game=meditation" },
    ];
  }

  if (energy === "high") {
    return [
      { label: "Focus session", detail: "A timed block with forest sounds", to: "/music?track=birds" },
      { label: "Ground yourself first", detail: "5-4-3-2-1 senses exercise", to: "/activities?game=grounding" },
      { label: "Note what's working", detail: "Two lines in your journal", to: "/journal?mode=write" },
    ];
  }

  return [
    { label: "Relax your muscles", detail: "Progressive muscle relaxation", to: "/activities?game=pmr" },
    { label: "Light reflection", detail: "Five short questions about your day", to: "/journal?mode=qa" },
    { label: "Calming game", detail: "Mindful colouring", to: "/activities?game=coloring" },
  ];
}
