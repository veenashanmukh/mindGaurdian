import { useEffect, useState } from "react";

// Box breathing: four phases of four seconds. The orb grows on the in-breath,
// stays full while holding, shrinks on the out-breath and rests while empty.
const PHASES = [
  { key: "in", label: "Breathe in", scale: 1 },
  { key: "hold-in", label: "Hold", scale: 1 },
  { key: "out", label: "Breathe out", scale: 0.55 },
  { key: "hold-out", label: "Rest", scale: 0.55 },
];
const SECONDS = 4;
const ROUNDS = 4;

export default function BreathingGame({ onClose }) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // whole seconds since Start
  const total = PHASES.length * SECONDS * ROUNDS;
  const done = elapsed >= total;

  const active = running && !done;

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [active]);

  const start = () => { if (done) setElapsed(0); setRunning(true); };
  const phaseIndex = Math.floor(elapsed / SECONDS) % PHASES.length;
  const count = SECONDS - (elapsed % SECONDS);
  const round = Math.min(ROUNDS, Math.floor(elapsed / (SECONDS * PHASES.length)) + 1);
  const phase = PHASES[phaseIndex];
  const scale = active ? phase.scale : 0.55;

  return (
    <div className="mg-card mg-breath">
      <h2>Box breathing</h2>
      <p className="mg-muted">Four rounds, about a minute. Follow the circle.</p>

      <div className="mg-breath__stage" aria-hidden="true">
        <div className="mg-orb" style={{ transform: `scale(${scale})`, transitionDuration: `${SECONDS}s` }} />
      </div>

      <div className="mg-breath__cue" aria-live="polite">
        {done ? "Well done." : active ? <>{phase.label} <span className="mg-breath__count">{count}</span></> : "Ready when you are."}
      </div>
      {active && <div className="mg-muted">Round {round} of {ROUNDS}</div>}

      <div className="mg-row mg-row--center">
        {!active && <button className="mg-btn" onClick={start}>{done ? "Go again" : elapsed > 0 ? "Resume" : "Start"}</button>}
        {active && <button className="mg-btn mg-btn--soft" onClick={() => setRunning(false)}>Pause</button>}
        {onClose && <button className="mg-btn mg-btn--ghost" onClick={onClose}>Done</button>}
      </div>
    </div>
  );
}
