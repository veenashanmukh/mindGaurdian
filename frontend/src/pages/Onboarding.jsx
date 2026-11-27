import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { trackOnboardingComplete } from "../services/analyticsService";
import BuddhaFigure from "../components/BuddhaFigure";

// The orb breathes on a 10-second cycle; the cue below it follows along.
function BreathCue() {
  const [inhale, setInhale] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setInhale((v) => !v), 5000);
    return () => clearInterval(t);
  }, []);
  return <p className="mg-welcome__cue" aria-hidden="true">{inhale ? "Breathe in…" : "…and out"}</p>;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(user?.age || "");
  const [error, setError] = useState("");
  const returning = !!user?.name;

  const handleContinue = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Tell us what to call you."); return; }
    if (!age || Number(age) < 10 || Number(age) > 120) { setError("Please enter an age between 10 and 120."); return; }
    const next = { ...user, name: name.trim(), age };
    setUser(next);
    try { trackOnboardingComplete(); } catch { /* analytics optional */ }
    navigate("/permissions");
  };

  return (
    <main className="mg-welcome">
      <div className="mg-welcome__stage" aria-hidden="true">
        <div className="mg-welcome__orb" />
        <BuddhaFigure className="mg-welcome__buddha" />
      </div>
      <BreathCue />

      <div className="mg-welcome__body">
        <h1 className="mg-welcome__title">It's okay not to be okay.</h1>
        <p className="mg-welcome__lede">MindGuardian helps you notice stress early, and gives you small, gentle ways to feel better.</p>

        {returning ? (
          <div className="mg-welcome__form">
            <p>Welcome back, {user.name}.</p>
            <button className="mg-btn mg-btn--wide" onClick={() => navigate("/dashboard")}>Continue</button>
          </div>
        ) : (
          <form className="mg-welcome__form" onSubmit={handleContinue} noValidate>
            <label className="mg-field">
              <span>What should we call you?</span>
              <input value={name} onChange={(e) => { setName(e.target.value); setError(""); }} autoComplete="given-name" />
            </label>
            <label className="mg-field">
              <span>Your age</span>
              <input type="number" inputMode="numeric" value={age} onChange={(e) => { setAge(e.target.value); setError(""); }} />
            </label>
            {error && <p className="mg-error" role="alert">{error}</p>}
            <button className="mg-btn mg-btn--wide" type="submit">Begin</button>
            <p className="mg-muted mg-welcome__note">Stays on your device. No account needed.</p>
          </form>
        )}
      </div>
    </main>
  );
}
