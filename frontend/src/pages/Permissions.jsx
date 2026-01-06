import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { sendTestNotification } from "../services/notificationService";

const STEPS = [
  'notifications',
  'screenTime',
  'voice',
  'wearable',
];

export default function Permissions() {
  const { user, setUser } = useContext(UserContext);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // ensure user object exists
    if (!user) return;
  }, [user]);

  async function requestNotification() {
    try {
      if (!('Notification' in window)) {
        alert('Notifications not supported in this browser');
        setUser((p) => ({ ...p, permissions: { ...p.permissions, notifications: false } }));
        return;
      }

      const result = await Notification.requestPermission();
      const allowed = result === 'granted';
      setUser((p) => ({ ...p, permissions: { ...p.permissions, notifications: allowed } }));
      if (allowed) sendTestNotification('MindGuardian enabled notifications', { body: 'This is a test notification.' });
    } catch (err) {
      console.error(err);
    }
  }

  function requestScreenTime() {
    // no browser permission; ask for consent and start tracking
    const ok = confirm('Allow MindGuardian to track app foreground time to enable screen-time aware suggestions?');
    setUser((p) => ({ ...p, permissions: { ...p.permissions, screenTime: ok }, screenTimeData: { ...p.screenTimeData, lastStart: ok ? Date.now() : null } }));
  }

  async function requestVoice() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // immediately stop; this is a permission test
      stream.getTracks().forEach((t) => t.stop());
      setUser((p) => ({ ...p, permissions: { ...p.permissions, voice: true } }));
    } catch (err) {
      setUser((p) => ({ ...p, permissions: { ...p.permissions, voice: false } }));
    }
  }

  function requestWearable() {
    const ok = confirm('MindGuardian can integrate with wearables in advanced mode (structure only). Allow simulated wearable data?');
    setUser((p) => ({ ...p, permissions: { ...p.permissions, wearable: ok } }));
  }

  async function handleAction() {
    const step = STEPS[index];
    if (step === 'notifications') await requestNotification();
    if (step === 'screenTime') requestScreenTime();
    if (step === 'voice') await requestVoice();
    if (step === 'wearable') requestWearable();

    if (index + 1 < STEPS.length) setIndex(index + 1);
    else navigate('/check');
  }

  const step = STEPS[index];

  const titleMap = {
    notifications: 'Notifications',
    screenTime: 'Screen time',
    voice: 'Voice (microphone)',
    wearable: 'Wearables (optional)',
  };

  const descMap = {
    notifications: 'Enable notifications to receive gentle reminders from MindGuardian.',
    screenTime: 'Allow tracking app foreground time to improve personalization (no data leaves your device).',
    voice: 'Optional: allow microphone for voice check-ins and voice-based activities.',
    wearable: 'Optional: allow integration with wearable devices (structure only in this build).',
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 720, width: '100%' }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 10px 30px rgba(2,6,23,0.06)' }}>
          <h2>{titleMap[step]}</h2>
          <p style={{ color: '#6b7280' }}>{descMap[step]}</p>

          <div style={{ marginTop: 12 }}>
            <button onClick={handleAction}>Allow / Continue</button>
            <button style={{ marginLeft: 8 }} onClick={() => { if (index + 1 < STEPS.length) setIndex(index + 1); else navigate('/check'); }}>Skip</button>
          </div>

          <div style={{ marginTop: 12, color: '#94a3b8' }}>You can change these later in Profile.</div>
        </div>
      </div>
    </div>
  );
}
