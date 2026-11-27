import { useState, useContext } from "react";
import { UserContext } from "../../context/UserContext";

export default function VoiceCheck() {
  const [status, setStatus] = useState("idle");
  const { user, setUser } = useContext(UserContext);

  async function requestMic() {
    try {
      setStatus("requesting");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setStatus("granted");
      setUser((p) => ({ ...p, permissions: { ...p.permissions, voice: true } }));
    } catch (err) {
      setStatus("denied");
      setUser((p) => ({ ...p, permissions: { ...p.permissions, voice: false } }));
    }
  }

  return (
    <div style={{
      border: "1px dashed #e6e6f0",
      padding: "16px",
      borderRadius: "8px",
      marginTop: "16px",
      background: '#fff'
    }}>
      <h3>Voice Check-in (Optional)</h3>
      <p style={{ fontSize: "14px", color: "#555" }}>
        Voice input is optional. You can enable the microphone to use voice
        activities. Recordings stay on your device.
      </p>

      <div style={{ marginTop: 8 }}>
        <button onClick={requestMic}>Request Microphone (optional)</button>
        <span style={{ marginLeft: 12, color: "#555" }}>Status: {status}</span>
      </div>
    </div>
  );
}
