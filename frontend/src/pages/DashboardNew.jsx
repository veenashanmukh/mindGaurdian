import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Suggestions from "../components/dashboard/Suggestions";
import { personalizeSuggestions } from "../logic/personalization";
import { generatePersonalizedForecast } from "../logic/forecastInference";

const ENERGY = [
  { value: "low", label: "Low", line: "Go easy today. Small things count." },
  { value: "normal", label: "Steady", line: "A steady day. Keep a little room to breathe." },
  { value: "high", label: "Wired", line: "Lots of energy. Point it somewhere useful, then rest." },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user, setUser } = useContext(UserContext);
  const energy = ENERGY.find((e) => e.value === user.energy) || ENERGY[1];
  const suggestions = personalizeSuggestions(user.energy);
  const forecast = useMemo(() => generatePersonalizedForecast(user), [user]);
  const today = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
  const lastReflection = (user.reflections || []).slice(-1)[0];

  function checkIn(value) {
    setUser((p) => ({
      ...p,
      energy: value,
      checkIns: [...(p.checkIns || []), { kind: "energy", value, date: new Date().toISOString() }],
    }));
  }

  return (
    <div className="mg-page mg-page--wide">
      <header className="mg-hello">
        <h1>{greeting()}{user.name ? `, ${user.name}` : ""}.</h1>
        <p className="mg-hello__line">{energy.line}</p>
      </header>

      <div className="mg-dash">
        <section className="mg-card mg-dash__energy" aria-labelledby="checkin-title">
          <h2 id="checkin-title" className="mg-card__title">How's your energy?</h2>
          <div className="mg-chips" role="group" aria-labelledby="checkin-title">
            {ENERGY.map((e) => (
              <button key={e.value} className={`mg-chip${user.energy === e.value ? " is-on" : ""}`} aria-pressed={user.energy === e.value} onClick={() => checkIn(e.value)}>
                {e.label}
              </button>
            ))}
          </div>
          <p className="mg-muted" style={{ marginBottom: 0 }}>
            {(user.checkIns || []).length} check-ins so far. <Link to="/check">Take the 5-question check</Link>
          </p>
        </section>

        <section className="mg-card mg-dash__suggest" aria-labelledby="sugg-title">
          <h2 id="sugg-title" className="mg-card__title">Try one of these</h2>
          <Suggestions items={suggestions} />
        </section>

        <section className="mg-card mg-dash__week" aria-labelledby="week-title">
          <h2 id="week-title" className="mg-card__title">Your week, as it might feel</h2>
          <p className="mg-muted">Based on your check-ins and journal. It gets more personal the more you use it.</p>
          <ol className="mg-week">
            {forecast.map((d) => (
              <li key={d.day} className={d.day === today ? "is-today" : ""}>
                <span className="mg-week__emoji" aria-hidden="true">{d.emoji}</span>
                <span className="mg-week__day">{d.day}</span>
                <span className="mg-week__label">{d.label}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mg-card mg-dash__refl" aria-labelledby="refl-title">
          <h2 id="refl-title" className="mg-card__title">Last reflection</h2>
          {lastReflection ? (
            <>
              <p className="mg-entry__text">{lastReflection.text}</p>
              <p className="mg-muted" style={{ marginBottom: 0 }}>{lastReflection.date}</p>
            </>
          ) : (
            <p className="mg-muted">Nothing yet. A sentence before bed helps close the day.</p>
          )}
          <Link to="/reflection">Write tonight's reflection</Link>
        </section>
      </div>
    </div>
  );
}
