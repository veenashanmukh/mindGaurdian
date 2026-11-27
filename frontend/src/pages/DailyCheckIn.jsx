import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

export default function DailyCheckIn() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const quickPick = (energy) => {
    setUser((prev) => ({ ...prev, energy, checkIns: [...(prev.checkIns || []), { kind: "energy", value: energy, date: new Date().toISOString() }] }));
    navigate("/dashboard");
  };

  return (
    <div className="mg-page">
      <header className="mg-page__head">
        <h1>Quick check-in</h1>
        <p className="mg-muted">Which is closest to your energy right now?</p>
      </header>
      <div className="mg-options">
        <button className="mg-option" onClick={() => quickPick("low")}>Low: running on empty</button>
        <button className="mg-option" onClick={() => quickPick("normal")}>Steady: getting through it</button>
        <button className="mg-option" onClick={() => quickPick("high")}>Wired: lots of energy, maybe restless</button>
      </div>
      <p className="mg-muted">Home adjusts its suggestions to your answer.</p>
    </div>
  );
}
