import { useState, useEffect } from "react";
import Card from "../common/Card";

// ============================================================
// Mindful Coloring/Visual Focus Game
// ============================================================
// Purpose: Engage focus through interactive color/pattern
//          exploration to reduce rumination
// How it works: User taps/clicks sections to color them,
//              meditative pace, no time pressure
// Research: Coloring reduces anxiety, improves focus & flow
// ============================================================

export default function MindfulColoringGame() {
  const gridSize = 6; // 6x6 grid
  const [grid, setGrid] = useState(
    Array(gridSize * gridSize)
      .fill(0)
      .map(() => ({ colored: false, color: null }))
  );
  const [selectedColor, setSelectedColor] = useState("#7c3aed");
  const [completed, setCompleted] = useState(false);

  const colors = ["#7c3aed", "#f472b6", "#fbbf24", "#10b981", "#3b82f6", "#f87171"];

  const handleClickCell = (idx) => {
    const newGrid = [...grid];
    newGrid[idx].colored = !newGrid[idx].colored;
    if (newGrid[idx].colored) {
      newGrid[idx].color = selectedColor;
    }
    setGrid(newGrid);

    // Check if all colored
    if (newGrid.every((cell) => cell.colored)) {
      setCompleted(true);
    }
  };

  const handleReset = () => {
    setGrid(
      Array(gridSize * gridSize)
        .fill(0)
        .map(() => ({ colored: false, color: null }))
    );
    setCompleted(false);
  };

  const coloredCount = grid.filter((cell) => cell.colored).length;

  if (completed) {
    return (
      <Card style={{ padding: "2rem", textAlign: "center" }}>
        <h2>✅ Artwork Complete!</h2>
        <p>You've created a beautiful, mindful piece. Take a moment to appreciate it.</p>
        <button onClick={handleReset} style={{ marginTop: "1rem", padding: "10px 20px" }}>
          Start Over
        </button>
      </Card>
    );
  }

  return (
    <Card style={{ padding: "2rem" }}>
      <h2 style={{ marginTop: 0 }}>🎨 Mindful Coloring</h2>
      <p style={{ color: "#6b7280" }}>Tap each square to color it. No rush — enjoy the process.</p>

      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: "0.5rem" }}>Choose a color:</div>
        <div style={{ display: "flex", gap: 8 }}>
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: color,
                border: selectedColor === color ? "3px solid #000" : "2px solid #d1d5db",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: 6,
          marginBottom: "1.5rem",
          background: "#f8fafc",
          padding: 12,
          borderRadius: 12,
        }}
      >
        {grid.map((cell, idx) => (
          <div
            key={idx}
            onClick={() => handleClickCell(idx)}
            style={{
              aspectRatio: "1/1",
              background: cell.colored ? cell.color : "#fff",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              cursor: "pointer",
              transition: "all 0.2s",
              opacity: cell.colored ? 1 : 0.7,
            }}
          />
        ))}
      </div>

      <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center" }}>
        {coloredCount} of {gridSize * gridSize} colored
      </div>
    </Card>
  );
}
