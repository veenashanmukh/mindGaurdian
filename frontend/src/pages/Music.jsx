import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createAmbientPlayer } from "../services/ambient";

const TRACKS = [
  { id: "rain", title: "Rain on glass", detail: "Steady rain with the odd heavy drop" },
  { id: "ocean", title: "Ocean waves", detail: "Slow swells, about nine seconds each" },
  { id: "birds", title: "Forest morning", detail: "Light wind and distant birds" },
  { id: "piano", title: "Soft piano", detail: "Unhurried notes with a gentle echo" },
];

const TIMERS = [0, 5, 15, 30];

export default function Music() {
  const [params] = useSearchParams();
  const initial = TRACKS.find((t) => t.id === params.get("track")) || TRACKS[0];
  const [player] = useState(() => createAmbientPlayer());
  const [current, setCurrent] = useState(initial);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [timer, setTimer] = useState(0); // minutes, 0 = off
  const [remaining, setRemaining] = useState(0); // seconds
  const [error, setError] = useState("");

  useEffect(() => () => player.close(), [player]);

  useEffect(() => { player.setVolume(volume); }, [player, volume]);

  // sleep / focus timer: counts down while playing, then fades the sound out
  useEffect(() => {
    if (!playing || !timer) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(t); player.stop(); setPlaying(false); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [player, playing, timer]);

  function chooseTimer(m) {
    setTimer(m);
    setRemaining(m * 60);
  }

  async function play(track) {
    setError("");
    if (!player.supported) {
      setError("This browser can't generate sound. Try Chrome, Edge, Firefox or Safari.");
      return;
    }
    try {
      await player.play(track.id, volume);
      setCurrent(track);
      setRemaining(timer * 60);
      setPlaying(true);
    } catch {
      setError("Couldn't start the sound. Check your device isn't muted and try again.");
    }
  }

  function toggle() {
    if (playing) { player.stop(); setPlaying(false); }
    else play(current);
  }

  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="mg-page">
      <header className="mg-page__head">
        <h1>Sounds</h1>
        <p className="mg-muted">Background sound to rest, focus or fall asleep to. Generated on your device, so it never ends abruptly.</p>
      </header>

      <div className="mg-card mg-player">
        <div className={`mg-player__art mg-player__art--${current.id}${playing ? " is-playing" : ""}`} aria-hidden="true" />
        <div className="mg-player__meta">
          <div className="mg-player__title">{current.title}</div>
          <div className="mg-muted">{current.detail}</div>
        </div>
        <button className="mg-btn mg-player__toggle" onClick={toggle} aria-pressed={playing}>
          {playing ? "Pause" : "Play"}
        </button>

        <label className="mg-field">
          <span>Volume</span>
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
        </label>

        <div className="mg-field">
          <span>Stop after</span>
          <div className="mg-chips" role="group" aria-label="Stop after">
            {TIMERS.map((m) => (
              <button key={m} className={`mg-chip${timer === m ? " is-on" : ""}`} aria-pressed={timer === m} onClick={() => chooseTimer(m)}>
                {m === 0 ? "Off" : `${m} min`}
              </button>
            ))}
          </div>
        </div>
        {playing && timer > 0 && <div className="mg-muted">Stops in {mm}:{ss}</div>}
        {error && <p className="mg-error" role="alert">{error}</p>}
      </div>

      <h2 className="mg-section-title">All sounds</h2>
      <ul className="mg-list">
        {TRACKS.map((t) => (
          <li key={t.id}>
            <button className={`mg-list__item${current.id === t.id ? " is-current" : ""}`} onClick={() => play(t)}>
              <span className={`mg-swatch mg-swatch--${t.id}`} aria-hidden="true" />
              <span>
                <span className="mg-list__title">{t.title}</span>
                <span className="mg-muted mg-block">{t.detail}</span>
              </span>
              {current.id === t.id && playing && <span className="mg-now">Playing</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
