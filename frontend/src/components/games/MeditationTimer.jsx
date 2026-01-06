import { useState, useEffect } from "react";
import Card from "../common/Card";

// ============================================================
// Meditation & Mindfulness Timer
// ============================================================
// Purpose: Guided meditation with customizable duration and
//          ambient visual feedback
// How it works: User sets time, app provides bell/chime cues,
//              visual pulse animation, timer feedback
// Research: Meditation reduces stress, improves emotional
//           regulation, enhances focus over time
// ============================================================

export default function MeditationTimer() {
  const [duration, setDuration] = useState(5); // minutes
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(duration * 60);
  const [completed, setCompleted] = useState(false);

  // Timer logic
  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  // Handle completion
  useEffect(() => {
    if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      setCompleted(true);
      playBell();
    }
  }, [secondsLeft, isRunning]);

  const playBell = () => {
    // Simple beep using Web Audio API
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.frequency.value = 528; // Healing frequency
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.5);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.5);
    } catch (e) {}
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(duration * 60);
    setCompleted(false);
  };

  const handleChangeDuration = (newDuration) => {
    setDuration(newDuration);
    setSecondsLeft(newDuration * 60);
    setCompleted(false);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = ((duration * 60 - secondsLeft) / (duration * 60)) * 100;

  if (completed) {
    return (
      <Card style={{ padding: "2rem", textAlign: "center" }}>
        <h2>🧘 Meditation Complete!</h2>
        <p>You've completed your {duration}-minute meditation. Well done!</p>
        <button onClick={handleReset} style={{ marginTop: "1rem", padding: "10px 20px" }}>
          Meditate Again
        </button>
      </Card>
    );
  }

  return (
    <Card style={{ padding: "2rem" }}>
      <h2 style={{ marginTop: 0 }}>🧘‍♀️ Meditation Timer</h2>

      {/* Duration selector */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: "0.5rem" }}>Duration (minutes):</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[3, 5, 10, 15, 20].map((min) => (
            <button
              key={min}
              onClick={() => handleChangeDuration(min)}
              disabled={isRunning}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: duration === min ? "2px solid #7c3aed" : "1px solid #d1d5db",
                background: duration === min ? "#ede9fe" : "white",
                cursor: isRunning ? "default" : "pointer",
                opacity: isRunning ? 0.5 : 1,
              }}
            >
              {min}m
            </button>
          ))}
        </div>
      </div>

      {/* Timer display */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "1.5rem",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 16,
          padding: "2rem",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${progress}%`,
            height: "100%",
            background: "rgba(255,255,255,0.2)",
            transition: "width 0.3s",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 56, fontWeight: 700, fontFamily: "monospace" }}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <div style={{ fontSize: 14, opacity: 0.9, marginTop: "0.5rem" }}>
            {isRunning ? "🔵 In progress" : "⊚ Paused"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8 }}>
        {!isRunning ? (
          <button
            onClick={handleStart}
            style={{
              flex: 1,
              padding: "12px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            ▶️ Start
          </button>
        ) : (
          <button
            onClick={handlePause}
            style={{
              flex: 1,
              padding: "12px",
              background: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            ⏸️ Pause
          </button>
        )}
        <button
          onClick={handleReset}
          style={{
            flex: 1,
            padding: "12px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          🔄 Reset
        </button>
      </div>
    </Card>
  );
}
