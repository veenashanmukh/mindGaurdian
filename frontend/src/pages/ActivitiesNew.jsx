import { useContext, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Card from "../components/common/Card";
import { analyzeAudioBlob } from "../logic/audioTone";
import BreathingGame from "../components/games/BreathingGame";
import CalmGame from "../components/games/CalmGame";
import GroundingGame from "../components/games/GroundingGame";
import PMRGame from "../components/games/PMRGame";
import MindfulColoringGame from "../components/games/MindfulColoringGame";
import MeditationTimer from "../components/games/MeditationTimer";

const GAMES = [
  { id: "breathing", title: "Breathing", detail: "Box breathing, four counts each way", Component: BreathingGame },
  { id: "meditation", title: "Quiet timer", detail: "Sit for 1 to 10 minutes", Component: MeditationTimer },
  { id: "grounding", title: "Grounding", detail: "5-4-3-2-1 with your senses", Component: GroundingGame },
  { id: "pmr", title: "Muscle relaxation", detail: "Tense, then release, one area at a time", Component: PMRGame },
  { id: "coloring", title: "Mindful colouring", detail: "Fill a small grid, no rush", Component: MindfulColoringGame },
  { id: "calm", title: "Calm tapping", detail: "Tap the drops, slowly", Component: CalmGame },
];

export default function Activities() {
  const { setUser } = useContext(UserContext);
  const [params, setParams] = useSearchParams();
  const activeId = params.get("game");
  const active = GAMES.find((g) => g.id === activeId);

  const [recording, setRecording] = useState(false);
  const [toneResult, setToneResult] = useState(null);
  const [voiceError, setVoiceError] = useState("");
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const audioRef = useRef(null);

  // Release the microphone only when leaving the page. (Running this whenever the
  // recorder changed used to stop the mic right after recording started.)
  useEffect(() => {
    return () => {
      const mr = recorderRef.current;
      if (mr && mr.state !== "inactive") mr.stop();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Log each exercise that is opened, so the Profile page can show recent activity.
  useEffect(() => {
    if (!active) return;
    setUser((prev) => ({
      ...prev,
      activityLog: [...(prev.activityLog || []), { type: active.id, title: active.title, date: new Date().toISOString() }].slice(-50),
    }));
    window.scrollTo(0, 0);
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const openGame = (id) => setParams({ game: id });
  const closeGame = () => setParams({});

  async function startRecording() {
    setVoiceError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setVoiceError("This browser can't record audio. Try Chrome or Edge.");
      return;
    }
    try {
      // Ask for the microphone here, so skipping it during setup doesn't block this feature.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setUser((p) => ({ ...p, permissions: { ...p.permissions, voice: true } }));
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(blob);
          audioRef.current.load();
        }
        setToneResult("analyzing");
        try {
          const res = await analyzeAudioBlob(blob);
          if (res?.tone) {
            setToneResult(res.tone);
            setUser((prev) => ({
              ...prev,
              situations: [...(prev.situations || []), `voice:${res.tone}`],
              checkIns: [...(prev.checkIns || []), { kind: "voice", value: res.tone, date: new Date().toISOString() }],
            }));
          } else {
            console.warn("Voice analysis failed:", res?.error);
            setToneResult("failed");
          }
        } catch (err) {
          console.warn("Voice analysis failed:", err);
          setToneResult("failed");
        }
      };
      mr.start();
      recorderRef.current = mr;
      setRecording(true);
    } catch (err) {
      setUser((p) => ({ ...p, permissions: { ...p.permissions, voice: false } }));
      setVoiceError(
        err?.name === "NotAllowedError"
          ? "Microphone access is blocked. Allow it from the lock icon in your address bar, then try again."
          : "Couldn't start recording. Check that a microphone is connected."
      );
    }
  }

  function stopRecording() {
    try { recorderRef.current?.stop(); } catch { /* already stopped */ }
    setRecording(false);
  }

  if (active) {
    const { Component } = active;
    return (
      <div className="mg-page">
        <button className="mg-btn mg-btn--ghost mg-back" onClick={closeGame}>← All activities</button>
        <Component onClose={closeGame} />
      </div>
    );
  }

  const toneCopy = {
    calm: "You sound calm. Nice.",
    tense: "You sound a little tense. A breathing round might help.",
    neutral: "You sound steady.",
  };

  return (
    <div className="mg-page">
      <header className="mg-page__head">
        <h1>Activities</h1>
        <p className="mg-muted">Short exercises for when your mind feels crowded.</p>
      </header>

      <section aria-labelledby="games-title">
        <h2 id="games-title" className="mg-section-title">Calm down</h2>
        <div className="mg-tiles">
          {GAMES.map((g) => (
            <Card key={g.id} onClick={() => openGame(g.id)} className="mg-tile">
              <div className="mg-tile__title">{g.title}</div>
              <div className="mg-muted">{g.detail}</div>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="voice-title">
        <h2 id="voice-title" className="mg-section-title">Voice check-in</h2>
        <Card>
          <p className="mg-muted" style={{ marginTop: 0 }}>
            Say a few sentences about your day. MindGuardian listens to the tone of your voice (not the words) and suggests what might help. The analysis runs on your device.
          </p>
          {!recording ? (
            <button className="mg-btn" onClick={startRecording}>Start recording</button>
          ) : (
            <button className="mg-btn mg-btn--alert" onClick={stopRecording}>Stop and analyse</button>
          )}
          {recording && <span className="mg-recording" aria-live="polite">Recording…</span>}
          {voiceError && <p className="mg-error" role="alert">{voiceError}</p>}
          <audio ref={audioRef} controls className="mg-audio" hidden={!toneResult} />
          {toneResult && (
            <p aria-live="polite" style={{ marginBottom: 0 }}>
              {toneResult === "analyzing" && "Listening back…"}
              {toneResult === "failed" && "Couldn't read that recording. Try speaking a little longer."}
              {toneCopy[toneResult] && <><strong>{toneCopy[toneResult]}</strong>{toneResult === "tense" && <> <button className="mg-link" onClick={() => openGame("breathing")}>Start breathing</button></>}</>}
            </p>
          )}
        </Card>
      </section>

      <section aria-labelledby="journal-title">
        <h2 id="journal-title" className="mg-section-title">Write it down</h2>
        <div className="mg-tiles mg-tiles--two">
          <Link to="/journal?mode=write" className="mg-card mg-card--action mg-tile">
            <div className="mg-tile__title">Write freely</div>
            <div className="mg-muted">A blank page for whatever's on your mind</div>
          </Link>
          <Link to="/journal?mode=qa" className="mg-card mg-card--action mg-tile">
            <div className="mg-tile__title">Guided questions</div>
            <div className="mg-muted">Five prompts, with a summary at the end</div>
          </Link>
        </div>
      </section>
    </div>
  );
}
