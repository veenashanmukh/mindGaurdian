import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { sendTestNotification } from "../services/notificationService";

const PERMS = [
  { key: "notifications", title: "Gentle reminders", detail: "Browser notifications for check-ins" },
  { key: "voice", title: "Microphone", detail: "For voice check-ins on the Activities page" },
  { key: "screenTime", title: "Screen time", detail: "Counts time spent in this app, on this device only" },
  { key: "wearable", title: "Wearable data", detail: "Simulated in this version" },
];

const ENERGY = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Steady" },
  { value: "high", label: "Wired" },
];

function formatDate(iso) {
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function Profile() {
  const { user, setUser, resetUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [name, setName] = useState(user.name || "");
  const [age, setAge] = useState(user.age || "");
  const [saved, setSaved] = useState("");
  const [permMsg, setPermMsg] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  function saveDetails(e) {
    e.preventDefault();
    if (!name.trim()) { setSaved("Please add a name."); return; }
    const next = { ...user, name: name.trim(), age };
    setUser(next);
    setSaved("Saved.");
    setTimeout(() => setSaved(""), 2500);
  }

  function setEnergy(value) {
    setUser((p) => ({
      ...p,
      energy: value,
      checkIns: [...(p.checkIns || []), { kind: "energy", value, date: new Date().toISOString() }],
    }));
  }

  async function togglePermission(key) {
    setPermMsg("");
    const turningOn = !user.permissions?.[key];
    let allowed = turningOn;

    if (turningOn && key === "notifications") {
      if (!("Notification" in window)) { setPermMsg("This browser doesn't support notifications."); return; }
      const result = await Notification.requestPermission();
      allowed = result === "granted";
      if (allowed) sendTestNotification("Reminders are on", { body: "MindGuardian will check in gently." });
      else setPermMsg("Notifications are blocked. Allow them from the lock icon in your address bar.");
    }
    if (turningOn && key === "voice") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        allowed = false;
        setPermMsg("Microphone access is blocked. Allow it from the lock icon in your address bar.");
      }
    }
    setUser((p) => ({
      ...p,
      permissions: { ...p.permissions, [key]: allowed },
      ...(key === "screenTime" ? { screenTimeData: { ...p.screenTimeData, lastStart: allowed ? Date.now() : null } } : {}),
    }));
  }

  const journals = user.journals || [];
  const reflections = user.reflections || [];
  const activity = [...(user.activityLog || [])].reverse().slice(0, 5);
  const initial = (user.name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="mg-page">
      <header className="mg-profile-head">
        <div className="mg-avatar" aria-hidden="true">{initial}</div>
        <div>
          <h1>{user.name || "Your profile"}</h1>
          <p className="mg-muted">Everything here is stored on this device.</p>
        </div>
      </header>

      <section className="mg-stats" aria-label="Your activity">
        <div><strong>{(user.checkIns || []).length}</strong><span>check-ins</span></div>
        <div><strong>{journals.length}</strong><span>journal entries</span></div>
        <div><strong>{(user.activityLog || []).length}</strong><span>exercises</span></div>
      </section>

      <section aria-labelledby="energy-title">
        <h2 id="energy-title" className="mg-section-title">How's your energy right now?</h2>
        <div className="mg-chips" role="group" aria-labelledby="energy-title">
          {ENERGY.map((e) => (
            <button key={e.value} className={`mg-chip${user.energy === e.value ? " is-on" : ""}`} aria-pressed={user.energy === e.value} onClick={() => setEnergy(e.value)}>
              {e.label}
            </button>
          ))}
        </div>
        <p className="mg-muted">Your suggestions on Home change with this. <Link to="/check">Take the 5-question check</Link> for a fuller picture.</p>
      </section>

      <section aria-labelledby="details-title">
        <h2 id="details-title" className="mg-section-title">Your details</h2>
        <form className="mg-card mg-form" onSubmit={saveDetails}>
          <label className="mg-field"><span>Name</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className="mg-field"><span>Age</span><input type="number" min="10" max="120" value={age} onChange={(e) => setAge(e.target.value)} /></label>
          <div className="mg-row">
            <button className="mg-btn" type="submit">Save changes</button>
            {saved && <span className="mg-muted" aria-live="polite">{saved}</span>}
          </div>
        </form>
      </section>

      <section aria-labelledby="perm-title">
        <h2 id="perm-title" className="mg-section-title">Permissions</h2>
        <ul className="mg-card mg-switches">
          {PERMS.map((p) => (
            <li key={p.key}>
              <div>
                <div className="mg-switches__title">{p.title}</div>
                <div className="mg-muted">{p.detail}</div>
              </div>
              <button
                role="switch"
                aria-checked={!!user.permissions?.[p.key]}
                aria-label={p.title}
                className={`mg-switch${user.permissions?.[p.key] ? " is-on" : ""}`}
                onClick={() => togglePermission(p.key)}
              />
            </li>
          ))}
        </ul>
        {permMsg && <p className="mg-error" role="alert">{permMsg}</p>}
      </section>

      <section aria-labelledby="writing-title">
        <h2 id="writing-title" className="mg-section-title">Your writing</h2>
        {journals.length === 0 && reflections.length === 0 ? (
          <p className="mg-muted">Nothing yet. <Link to="/journal">Write a journal entry</Link> or <Link to="/reflection">reflect on today</Link>.</p>
        ) : (
          <ul className="mg-entries">
            {[...journals.map((j) => ({ ...j, kind: "Journal" })), ...reflections.map((r) => ({ ...r, kind: "Reflection" }))]
              .slice(-6).reverse().map((j, i) => (
                <li key={i} className="mg-card">
                  <div className="mg-muted">{j.kind}, {j.date}</div>
                  <div className="mg-entry__text">{j.summary || j.text || (j.mode === "write" ? j.content : "Guided questions")}</div>
                </li>
              ))}
          </ul>
        )}
        <p><Link to="/reflection">Add an end-of-day reflection</Link></p>
      </section>

      {activity.length > 0 && (
        <section aria-labelledby="recent-title">
          <h2 id="recent-title" className="mg-section-title">Recent exercises</h2>
          <ul className="mg-plain">
            {activity.map((a, i) => <li key={i}>{a.title}<span className="mg-muted">, {formatDate(a.date)}</span></li>)}
          </ul>
        </section>
      )}

      <section aria-labelledby="data-title">
        <h2 id="data-title" className="mg-section-title">Your data</h2>
        {!confirmReset ? (
          <button className="mg-btn mg-btn--ghost" onClick={() => setConfirmReset(true)}>Clear my data</button>
        ) : (
          <div className="mg-card mg-confirm" role="alert">
            <p style={{ marginTop: 0 }}>This deletes your details, check-ins and journal entries from this device. It can't be undone.</p>
            <div className="mg-row">
              <button className="mg-btn mg-btn--alert" onClick={() => { resetUser(); navigate("/"); }}>Delete everything</button>
              <button className="mg-btn mg-btn--ghost" onClick={() => setConfirmReset(false)}>Keep my data</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
