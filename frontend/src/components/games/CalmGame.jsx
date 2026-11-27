import { useState } from "react";

// Tap each drop slowly; each tap ripples and fades. Ten taps is a round.
const GOAL = 10;

export default function CalmGame({ onClose }) {
  const [taps, setTaps] = useState(0);
  const [ripple, setRipple] = useState(null);

  const tap = (i) => {
    setTaps((t) => t + 1);
    setRipple({ i, key: taps });
  };

  const finished = taps >= GOAL;

  return (
    <div className="mg-card mg-calm">
      <h2>Calm tapping</h2>
      <p className="mg-muted">
        {finished ? "That's ten slow taps. Notice your shoulders: are they a little lower?" : "Tap a drop, then wait for the ripple to fade before the next one."}
      </p>

      <div className="mg-drops">
        {[0, 1, 2].map((i) => (
          <button key={i} className="mg-drop" onClick={() => tap(i)} aria-label={`Drop ${i + 1}`}>
            {ripple && ripple.i === i && <span key={ripple.key} className="mg-ripple" />}
          </button>
        ))}
      </div>

      <div className="mg-progress" aria-label={`${Math.min(taps, GOAL)} of ${GOAL} taps`}>
        <div className="mg-progress__fill" style={{ width: `${(Math.min(taps, GOAL) / GOAL) * 100}%` }} />
      </div>

      <div className="mg-row mg-row--center">
        {finished && <button className="mg-btn mg-btn--soft" onClick={() => setTaps(0)}>Another round</button>}
        {onClose && <button className="mg-btn mg-btn--ghost" onClick={onClose}>Done</button>}
      </div>
    </div>
  );
}
