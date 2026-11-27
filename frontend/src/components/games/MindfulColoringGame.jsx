import { useState } from "react";
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
  const [selectedColor, setSelectedColor] = useState("#2F6B68");
  const [completed, setCompleted] = useState(false);

  const colors = ["#2F6B68", "#7FB3AC", "#A99BD3", "#E3B5A4", "#E9D7A3", "#8FA9C4"];

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
      <h2>Mindful colouring</h2>
      <p className="mg-muted">Pick a colour and fill the squares, slowly. There's no picture to get right.</p>

      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: "0.5rem" }}>Choose a color:</div>
        <div style={{ display: "flex", gap: 8 }}>
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              aria-label={`Colour ${color}`}
              aria-pressed={selectedColor === color}
              style={{
                padding: 0,
                width: 40,
                height: 40,
                background: color,
                border: 0,
                boxShadow: selectedColor === color ? "0 0 0 3px #FBFDFC, 0 0 0 5px #1F3438" : "none",
                borderRadius: "50%",
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
          background: "#E9F0EE",
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
              border: "1px solid #CFDDD9",
              borderRadius: 6,
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
