import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { sendTestNotification } from "../services/notificationService";

const STEPS = [
  { key: "notifications", title: "Gentle reminders", detail: "A quiet nudge to check in once a day. You can turn it off any time." },
  { key: "voice", title: "Voice check-ins", detail: "Lets you speak instead of type. Only the tone of your voice is analysed, on this device." },
  { key: "screenTime", title: "Screen time", detail: "Counts how long you spend in MindGuardian, to notice late-night use. Nothing leaves your device." },
];

export default function Permissions() {
  const { setUser } = useContext(UserContext);
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState("");
  const navigate = useNavigate();
  const step = STEPS[index];

  const next = () => {
    setNote("");
    if (index + 1 < STEPS.length) setIndex(index + 1);
    else navigate("/check");
  };

  const set = (key, value, extra = {}) => setUser((p) => ({ ...p, ...extra, permissions: { ...p.permissions, [key]: value } }));

  async function allow() {
    if (step.key === "notifications") {
      if (!("Notification" in window)) { setNote("This browser doesn't support notifications, so we'll skip this."); set("notifications", false); setTimeout(next, 1500); return; }
      const res = await Notification.requestPermission();
      set("notifications", res === "granted");
      if (res === "granted") sendTestNotification("Reminders are on", { body: "MindGuardian will check in gently." });
    }
    if (step.key === "voice") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        set("voice", true);
      } catch {
        set("voice", false);
      }
    }
    if (step.key === "screenTime") {
      set("screenTime", true, { screenTimeData: { totalForegroundMs: 0, lastStart: Date.now() } });
    }
    next();
  }

  return (
    <main className="mg-page mg-permissions">
      <div className="mg-progress" aria-hidden="true">
        <div className="mg-progress__fill" style={{ width: `${((index + 1) / STEPS.length) * 100}%` }} />
      </div>
      <p className="mg-muted">Step {index + 1} of {STEPS.length}. All optional.</p>
      <h1>{step.title}</h1>
      <p className="mg-lede">{step.detail}</p>
      <div className="mg-row">
        <button className="mg-btn" onClick={allow}>Allow</button>
        <button className="mg-btn mg-btn--ghost" onClick={next}>Not now</button>
      </div>
      {note && <p className="mg-muted" role="status">{note}</p>}
      <p className="mg-muted">You can change these later in Profile.</p>
    </main>
  );
}
