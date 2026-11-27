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

  // A soft two-note chime to end the session
  const playBell = () => {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      [528, 792].forEach((f, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.frequency.value = f;
        osc.type = "sine";
        const t = ac.currentTime + i * 0.35;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
        osc.start(t);
        osc.stop(t + 2.6);
      });
    } catch {
      // no audio available; the screen still shows the session is done
    }
  };

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
    <Card className="mg-breath">
      <h2>Quiet timer</h2>
      <p className="mg-muted">Sit comfortably. Let thoughts come and go, and come back to your breath.</p>

      <div className="mg-chips" role="group" aria-label="Minutes" style={{ justifyContent: "center" }}>
        {[1, 3, 5, 10].map((min) => (
          <button
            key={min}
            className={`mg-chip${duration === min ? " is-on" : ""}`}
            aria-pressed={duration === min}
            onClick={() => handleChangeDuration(min)}
            disabled={isRunning}
          >
            {min} min
          </button>
        ))}
      </div>

      <div className="mg-timer" style={{ "--p": `${progress}%` }}>
        <div className="mg-timer__time" aria-live="off">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <div className="mg-muted">{isRunning ? "Breathe naturally" : progress > 0 ? "Paused" : "Ready"}</div>
      </div>

      <div className="mg-row mg-row--center">
        {!isRunning ? (
          <button className="mg-btn" onClick={handleStart}>{progress > 0 ? "Resume" : "Start"}</button>
        ) : (
          <button className="mg-btn mg-btn--soft" onClick={handlePause}>Pause</button>
        )}
        <button className="mg-btn mg-btn--ghost" onClick={handleReset}>Reset</button>
      </div>
    </Card>
  );
}
