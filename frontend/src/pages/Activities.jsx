import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import Card from "../components/common/Card";
import { analyzeAudioBlob } from "../logic/audioTone";
import { uploadAudioBlob } from "../services/audioService";
import { saveUserProfile } from "../services/userService";
import BreathingGame from "../components/games/BreathingGame";
import CalmGame from "../components/games/CalmGame";

const JOURNAL_QUESTIONS = [
  "What was one good thing that happened today?",
  "How did you feel most of the day? What emotions came up?",
  "What was challenging or stressful today?",
  "How did you handle stress or difficult moments?",
  "What are you grateful for today?",
];

export default function Activities() {
  const { user, setUser } = useContext(UserContext);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [toneResult, setToneResult] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const streamRef = useRef(null);
  const [activeGame, setActiveGame] = useState(null);
  const [journalMode, setJournalMode] = useState(null);
  const [writeText, setWriteText] = useState("");
  const [qaAnswers, setQaAnswers] = useState({});
  const [summary, setSummary] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [mediaRecorder]);

  async function startRecording() {
    if (!user?.permissions?.voice) {
      alert("Microphone permission not granted. Enable it in Permissions.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      const recordedChunks = [];
      mr.ondataavailable = (e) => recordedChunks.push(e.data);
      mr.onstop = async () => {
        try {
          stream.getTracks().forEach((t) => t.stop());
        } catch (e) {}
        const blob = new Blob(recordedChunks, { type: "audio/webm" });
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(blob);
          audioRef.current.load();
        }
        setToneResult("Analyzing...");
        try {
          const res = await analyzeAudioBlob(blob);
          if (res?.tone) {
            setToneResult(res.tone);
            setUser((prev) => ({ ...prev, situations: [...(prev.situations || []), `voice:${res.tone}`] }));
            setUploadingAudio(true);
            const uid = (user && (user.name || user.id)) || "anonymous";
            try {
              const { url: audioUrl, path } = await uploadAudioBlob(blob, uid, { rms: res.rms, zcr: res.zcr, tone: res.tone });
              const newItem = { url: audioUrl, path, rms: res.rms, zcr: res.zcr, tone: res.tone, date: new Date().toISOString() };
              setUser((prev) => ({ ...prev, audios: [...(prev.audios || []), newItem] }));
              saveUserProfile({ ...(user || {}), audios: [...((user && user.audios) || []), newItem] });
            } catch (uploadErr) {
              console.warn("Audio upload failed:", uploadErr);
            } finally {
              setUploadingAudio(false);
            }
          } else {
            setToneResult("Analysis failed");
          }
        } catch (err) {
          console.error("Audio analysis failed:", err);
          setToneResult("Error analyzing audio");
        }
      };
      mr.start();
      setMediaRecorder(mr);
      setRecording(true);
    } catch (err) {
      alert("Unable to start recording: " + (err?.message || err));
    }
  }

  function stopRecording() {
    if (mediaRecorder) {
      try {
        mediaRecorder.stop();
      } catch (e) {}
      setRecording(false);
    }
  }

  async function generateAISummary() {
    const answers = Object.values(qaAnswers).filter((a) => a && a.trim());
    if (!answers.length) {
      alert("Please answer at least one question.");
      return;
    }
    setSummary("Generating summary...");
    const openaiKey = typeof import.meta !== "undefined" ? import.meta.env.VITE_OPENAI_API_KEY : undefined;
    if (openaiKey) {
      try {
        const messages = [
          {
            role: "system",
            content:
              "You are a compassionate assistant. When given journal responses, produce a short (2-4 sentence) natural-language summary that paraphrases the user (do NOT repeat their answers verbatim or list Q/A). End with one empathetic insight and one concise, actionable suggestion.",
          },
          { role: "user", content: `User answers:\n${answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}` },
        ];
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
          body: JSON.stringify({ model: "gpt-3.5-turbo", messages, max_tokens: 220 }),
        });
        if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) {
          setSummary(text);
          return;
        }
      } catch (err) {
        console.warn("OpenAI failed, falling back:", err);
      }
    }

    // Local fallback paraphrase
    const content = answers.join(" ");
    const tone = /\b(anxious|worried|stressed|nervous|tense)\b/i.test(content)
      ? "tense or stressed"
      : /\b(happy|joy|excited|good|great|wonderful)\b/i.test(content)
      ? "positive"
      : /\b(calm|relaxed|peaceful|content)\b/i.test(content)
      ? "calm"
      : "mixed";

    const sentences = [];
    sentences.push(`It seems you experienced a ${tone} day, with both meaningful moments and challenges.`);
    if (answers[0]) sentences.push("You noticed something small that felt uplifting.");
    if (answers[2]) sentences.push("You encountered a difficulty but used some helpful strategies.");
    if (answers[4]) sentences.push("You identified things you are grateful for.");

    const insight =
      tone === "tense or stressed"
        ? "A brief breathing pause could help when tension rises."
        : tone === "positive"
        ? "Try to notice what supported the good moments and repeat it."
        : "Keep using the strategies that felt helpful today.";

    setSummary(`${sentences.slice(0, 2).join(" ")}\n\nInsight: ${insight}`);
  }

  function handleQAChange(index, value) {
    setQaAnswers((prev) => ({ ...prev, [index]: value }));
  }

  function saveJournal() {
    const journalEntry = {
      date: new Date().toLocaleDateString(),
      mode: journalMode,
      content: journalMode === "write" ? writeText : JSON.stringify(qaAnswers),
      summary,
    };

    setUser((prev) => ({ ...prev, journals: [...(prev.journals || []), journalEntry] }));
    setSavedMessage("✅ Journal saved to your profile!");
    setTimeout(() => setSavedMessage(""), 3000);
  }

  if (activeGame === "breathing") {
    return (
      <div style={{ padding: "2rem" }}>
        <button onClick={() => setActiveGame(null)} style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}>← Back to Activities</button>
        <BreathingGame />
      </div>
    );
  }

  if (activeGame === "calm") {
    return (
      <div style={{ padding: "2rem" }}>
        <button onClick={() => setActiveGame(null)} style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}>← Back to Activities</button>
        <CalmGame />
      </div>
    );
  }

  if (journalMode === "write") {
    return (
      <div style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
        <button onClick={() => { setJournalMode(null); setWriteText(""); }} style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}>← Back to Activities</button>
        <h2>✍️ Free Writing</h2>
        <p style={{ color: "#6b7280" }}>Write your thoughts and feelings freely.</p>
        <textarea value={writeText} onChange={(e) => setWriteText(e.target.value)} placeholder="Start writing..." style={{ width: "100%", minHeight: 300, padding: "1rem", borderRadius: 8, border: "1px solid #d1d5db", marginBottom: "1rem" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveJournal} disabled={!writeText.trim()}>💾 Save Journal</button>
          <button onClick={() => setWriteText("")} style={{ background: "#f3f4f6", color: "#374151" }}>Clear</button>
        </div>
        {savedMessage && <div style={{ marginTop: "1rem", color: "#10b981", fontWeight: 700 }}>{savedMessage}</div>}
      </div>
    );
  }

  if (journalMode === "qa") {
    return (
      <div style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
        <button onClick={() => { setJournalMode(null); setQaAnswers({}); setSummary(null); }} style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}>← Back to Activities</button>
        <h2>❓ Guided Reflection</h2>
        {!summary ? (
          <>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>Answer these 5 questions about your day. Your answers will be analyzed to create a personalized summary.</p>
            {JOURNAL_QUESTIONS.map((q, i) => (
              <Card key={i} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Q{i + 1}. {q}</label>
                <textarea value={qaAnswers[i] || ""} onChange={(e) => handleQAChange(i, e.target.value)} placeholder="Your answer..." style={{ width: "100%", minHeight: 80, padding: "0.75rem", borderRadius: 8, border: "1px solid #d1d5db" }} />
              </Card>
            ))}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={generateAISummary}>🤖 Generate AI Summary</button>
              <button onClick={() => setQaAnswers({})} style={{ background: "#f3f4f6", color: "#374151" }}>Clear All</button>
            </div>
          </>
        ) : (
          <>
            <Card style={{ padding: "1.5rem", background: "#f0fdf4", borderLeft: "4px solid #10b981" }}>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{summary}</div>
            </Card>
            <div style={{ display: "flex", gap: 8, marginTop: "1.5rem" }}>
              <button onClick={saveJournal}>💾 Save Journal with Summary</button>
              <button onClick={() => setSummary(null)} style={{ background: "#f3f4f6", color: "#374151" }}>Regenerate</button>
            </div>
            {savedMessage && <div style={{ marginTop: "1rem", color: "#10b981", fontWeight: 700 }}>{savedMessage}</div>}
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
      <h2>Activities</h2>

      <Card style={{ padding: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>🎤 Voice Check-In</h3>
        <p style={{ color: "#6b7280", marginBottom: "1rem" }}>Record your voice to analyze tone and upload for personalized insights.</p>

        <div style={{ background: "#f9fafb", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: "1rem" }}>
            {!recording ? (
              <button onClick={startRecording} style={{ flex: 1, padding: "12px 16px", background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>🔴 Start Recording</button>
            ) : (
              <button onClick={stopRecording} style={{ flex: 1, padding: "12px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>⏹ Stop Recording</button>
            )}
          </div>

          <audio ref={audioRef} controls style={{ width: "100%", borderRadius: 8, marginTop: "0.5rem" }} />
        </div>

        {toneResult && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              {toneResult === "Analyzing..." ? (
                <div style={{ color: "#666", fontSize: 13 }}>📊 Analyzing audio...</div>
              ) : toneResult === "Error analyzing audio" ? (
                <div style={{ color: "#ef4444", fontSize: 13 }}>❌ {toneResult}</div>
              ) : (
                <div style={{ color: "#374151", fontSize: 13 }}>Detected tone: <strong style={{ color: toneResult === "calm" ? "#10b981" : toneResult === "tense" ? "#ef4444" : "#f59e0b" }}>{toneResult}</strong></div>
              )}
            </div>
            {uploadingAudio && <div style={{ fontSize: 12, color: "#666" }}>📤 Uploading...</div>}
          </div>
        )}
      </Card>

      <Card style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Mindfulness Games</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setActiveGame("breathing")}>🫁 Breathing Game</button>
          <button onClick={() => setActiveGame("calm")}>🧘 Calm Game</button>
        </div>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>📔 Journal</h3>
        <p style={{ color: "#6b7280", marginBottom: "1rem" }}>Reflect on your day and capture your thoughts and feelings.</p>
        <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
          <button onClick={() => setJournalMode("write")} style={{ textAlign: "left" }}>✍️ Write Freely</button>
          <button onClick={() => setJournalMode("qa")} style={{ textAlign: "left" }}>❓ Guided Q&A</button>
        </div>
      </Card>
    </div>
  );
}
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import Card from "../components/common/Card";
import { analyzeAudioBlob } from "../logic/audioTone";
import { uploadAudioBlob } from "../services/audioService";
import { saveUserProfile } from "../services/userService";
import BreathingGame from "../components/games/BreathingGame";
import CalmGame from "../components/games/CalmGame";

const JOURNAL_QUESTIONS = [
  "What was one good thing that happened today?",
  "How did you feel most of the day? What emotions came up?",
  "What was challenging or stressful today?",
  "How did you handle stress or difficult moments?",
  "What are you grateful for today?",
];

export default function Activities() {
  const { user, setUser } = useContext(UserContext);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [toneResult, setToneResult] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const streamRef = useRef(null);
  const [activeGame, setActiveGame] = useState(null);
  const [journalMode, setJournalMode] = useState(null);
  const [writeText, setWriteText] = useState("");
  const [qaAnswers, setQaAnswers] = useState({});
  const [summary, setSummary] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [mediaRecorder]);

  async function startRecording() {
    if (!user?.permissions?.voice) {
      alert("Microphone permission not granted. Enable it in Permissions.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      const recordedChunks = [];
      mr.ondataavailable = (e) => recordedChunks.push(e.data);
      mr.onstop = async () => {
        try {
          stream.getTracks().forEach((t) => t.stop());
        } catch (e) {}
        const blob = new Blob(recordedChunks, { type: "audio/webm" });
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(blob);
          audioRef.current.load();
        }
        setToneResult("Analyzing...");
        try {
          const res = await analyzeAudioBlob(blob);
          if (res?.tone) {
            setToneResult(res.tone);
            setUser((prev) => ({ ...prev, situations: [...(prev.situations || []), `voice:${res.tone}`] }));
            setUploadingAudio(true);
            const uid = (user && (user.name || user.id)) || "anonymous";
            try {
              const { url: audioUrl, path } = await uploadAudioBlob(blob, uid, { rms: res.rms, zcr: res.zcr, tone: res.tone });
              const newItem = { url: audioUrl, path, rms: res.rms, zcr: res.zcr, tone: res.tone, date: new Date().toISOString() };
              setUser((prev) => ({ ...prev, audios: [...(prev.audios || []), newItem] }));
              saveUserProfile({ ...(user || {}), audios: [...((user && user.audios) || []), newItem] });
            } catch (uploadErr) {
              console.warn("Audio upload failed:", uploadErr);
            } finally {
              setUploadingAudio(false);
            }
          } else {
            setToneResult("Analysis failed");
          }
        } catch (err) {
          console.error("Audio analysis failed:", err);
          setToneResult("Error analyzing audio");
        }
      };
      mr.start();
      setMediaRecorder(mr);
      setRecording(true);
    } catch (err) {
      alert("Unable to start recording: " + (err?.message || err));
    }
  }

  function stopRecording() {
    if (mediaRecorder) {
      try {
        mediaRecorder.stop();
      } catch (e) {}
      setRecording(false);
    }
  }

  async function generateAISummary() {
    const answers = Object.values(qaAnswers).filter((a) => a && a.trim());
    if (!answers.length) {
      alert("Please answer at least one question.");
      return;
    }
    setSummary("Generating summary...");
    const openaiKey = typeof import.meta !== "undefined" ? import.meta.env.VITE_OPENAI_API_KEY : undefined;
    if (openaiKey) {
      try {
        const messages = [
          {
            role: "system",
            content:
              "You are a compassionate assistant. When given journal responses, produce a short (2-4 sentence) natural-language summary that paraphrases the user (do NOT repeat their answers verbatim or list Q/A). End with one empathetic insight and one concise, actionable suggestion.",
          },
          { role: "user", content: `User answers:\n${answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}` },
        ];
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
          body: JSON.stringify({ model: "gpt-3.5-turbo", messages, max_tokens: 220 }),
        });
        if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) {
          setSummary(text);
          return;
        }
      } catch (err) {
        console.warn("OpenAI failed, falling back:", err);
      }
    }

    // Local fallback paraphrase
    const content = answers.join(" ");
    const tone = /\b(anxious|worried|stressed|nervous|tense)\b/i.test(content)
      ? "tense or stressed"
      : /\b(happy|joy|excited|good|great|wonderful)\b/i.test(content)
      ? "positive"
      : /\b(calm|relaxed|peaceful|content)\b/i.test(content)
      ? "calm"
      : "mixed";

    const sentences = [];
    sentences.push(`It seems you experienced a ${tone} day, with both meaningful moments and challenges.`);
    if (answers[0]) sentences.push("You noticed something small that felt uplifting.");
    if (answers[2]) sentences.push("You encountered a difficulty but used some helpful strategies.");
    if (answers[4]) sentences.push("You identified things you are grateful for.");

    const insight =
      tone === "tense or stressed"
        ? "A brief breathing pause could help when tension rises."
        : tone === "positive"
        ? "Try to notice what supported the good moments and repeat it."
        : "Keep using the strategies that felt helpful today.";

    setSummary(`${sentences.slice(0, 2).join(" ")}\n\nInsight: ${insight}`);
  }

  function handleQAChange(index, value) {
    setQaAnswers((prev) => ({ ...prev, [index]: value }));
  }

  function saveJournal() {
    const journalEntry = {
      date: new Date().toLocaleDateString(),
      mode: journalMode,
      content: journalMode === "write" ? writeText : JSON.stringify(qaAnswers),
      summary,
    };

    setUser((prev) => ({ ...prev, journals: [...(prev.journals || []), journalEntry] }));
    setSavedMessage("✅ Journal saved to your profile!");
    setTimeout(() => setSavedMessage(""), 3000);
  }

  if (activeGame === "breathing") {
    return (
      <div style={{ padding: "2rem" }}>
        <button onClick={() => setActiveGame(null)} style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}>← Back to Activities</button>
        <BreathingGame />
      </div>
    );
  }

  if (activeGame === "calm") {
    return (
      <div style={{ padding: "2rem" }}>
        <button onClick={() => setActiveGame(null)} style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}>← Back to Activities</button>
        <CalmGame />
      </div>
    );
  }

  if (journalMode === "write") {
    return (
      <div style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
        <button onClick={() => { setJournalMode(null); setWriteText(""); }} style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}>← Back to Activities</button>
        <h2>✍️ Free Writing</h2>
        <p style={{ color: "#6b7280" }}>Write your thoughts and feelings freely.</p>
        <textarea value={writeText} onChange={(e) => setWriteText(e.target.value)} placeholder="Start writing..." style={{ width: "100%", minHeight: 300, padding: "1rem", borderRadius: 8, border: "1px solid #d1d5db", marginBottom: "1rem" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveJournal} disabled={!writeText.trim()}>💾 Save Journal</button>
          <button onClick={() => setWriteText("")} style={{ background: "#f3f4f6", color: "#374151" }}>Clear</button>
        </div>
        {savedMessage && <div style={{ marginTop: "1rem", color: "#10b981", fontWeight: 700 }}>{savedMessage}</div>}
      </div>
    );
  }

  if (journalMode === "qa") {
    return (
      <div style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
        <button onClick={() => { setJournalMode(null); setQaAnswers({}); setSummary(null); }} style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}>← Back to Activities</button>
        <h2>❓ Guided Reflection</h2>
        {!summary ? (
          <>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>Answer these 5 questions about your day. Your answers will be analyzed to create a personalized summary.</p>
            {JOURNAL_QUESTIONS.map((q, i) => (
              <Card key={i} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Q{i + 1}. {q}</label>
                <textarea value={qaAnswers[i] || ""} onChange={(e) => handleQAChange(i, e.target.value)} placeholder="Your answer..." style={{ width: "100%", minHeight: 80, padding: "0.75rem", borderRadius: 8, border: "1px solid #d1d5db" }} />
              </Card>
            ))}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={generateAISummary}>🤖 Generate AI Summary</button>
              <button onClick={() => setQaAnswers({})} style={{ background: "#f3f4f6", color: "#374151" }}>Clear All</button>
            </div>
          </>
        ) : (
          <>
            <Card style={{ padding: "1.5rem", background: "#f0fdf4", borderLeft: "4px solid #10b981" }}>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{summary}</div>
            </Card>
            <div style={{ display: "flex", gap: 8, marginTop: "1.5rem" }}>
              <button onClick={saveJournal}>💾 Save Journal with Summary</button>
              <button onClick={() => setSummary(null)} style={{ background: "#f3f4f6", color: "#374151" }}>Regenerate</button>
            </div>
            {savedMessage && <div style={{ marginTop: "1rem", color: "#10b981", fontWeight: 700 }}>{savedMessage}</div>}
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
      <h2>Activities</h2>

      <Card style={{ padding: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>🎤 Voice Check-In</h3>
        <p style={{ color: "#6b7280", marginBottom: "1rem" }}>Record your voice to analyze tone and upload for personalized insights.</p>

        <div style={{ background: "#f9fafb", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: "1rem" }}>
            {!recording ? (
              <button onClick={startRecording} style={{ flex: 1, padding: "12px 16px", background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>🔴 Start Recording</button>
            ) : (
              <button onClick={stopRecording} style={{ flex: 1, padding: "12px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>⏹ Stop Recording</button>
            )}
          </div>

          <audio ref={audioRef} controls style={{ width: "100%", borderRadius: 8, marginTop: "0.5rem" }} />
        </div>

        {toneResult && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              {toneResult === "Analyzing..." ? (
                <div style={{ color: "#666", fontSize: 13 }}>📊 Analyzing audio...</div>
              ) : toneResult === "Error analyzing audio" ? (
                <div style={{ color: "#ef4444", fontSize: 13 }}>❌ {toneResult}</div>
              ) : (
                <div style={{ color: "#374151", fontSize: 13 }}>Detected tone: <strong style={{ color: toneResult === "calm" ? "#10b981" : toneResult === "tense" ? "#ef4444" : "#f59e0b" }}>{toneResult}</strong></div>
              )}
            </div>
            {uploadingAudio && <div style={{ fontSize: 12, color: "#666" }}>📤 Uploading...</div>}
          </div>
        )}
      </Card>

      <Card style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Mindfulness Games</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setActiveGame("breathing")}>🫁 Breathing Game</button>
          <button onClick={() => setActiveGame("calm")}>🧘 Calm Game</button>
        </div>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>📔 Journal</h3>
        <p style={{ color: "#6b7280", marginBottom: "1rem" }}>Reflect on your day and capture your thoughts and feelings.</p>
        <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
          <button onClick={() => setJournalMode("write")} style={{ textAlign: "left" }}>✍️ Write Freely</button>
          <button onClick={() => setJournalMode("qa")} style={{ textAlign: "left" }}>❓ Guided Q&A</button>
        </div>
      </Card>
    </div>
  );
}

import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import Card from "../components/common/Card";
import { analyzeAudioBlob } from "../logic/audioTone";
import { uploadAudioBlob } from "../services/audioService";
import { saveUserProfile } from "../services/userService";
import BreathingGame from "../components/games/BreathingGame";
import CalmGame from "../components/games/CalmGame";

const JOURNAL_QUESTIONS = [
  "What was one good thing that happened today?",
  "How did you feel most of the day? What emotions came up?",
  "What was challenging or stressful today?",
  "How did you handle stress or difficult moments?",
  "What are you grateful for today?",
];

export default function Activities() {
  const { user, setUser } = useContext(UserContext);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [toneResult, setToneResult] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const streamRef = useRef(null);
  const [activeGame, setActiveGame] = useState(null);
  const [journalMode, setJournalMode] = useState(null);
  const [writeText, setWriteText] = useState("");
  const [qaAnswers, setQaAnswers] = useState({});
  const [summary, setSummary] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [mediaRecorder]);
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import Card from "../components/common/Card";
import { analyzeAudioBlob } from "../logic/audioTone";
import { uploadAudioBlob } from "../services/audioService";
import { saveUserProfile } from "../services/userService";
import BreathingGame from "../components/games/BreathingGame";
import CalmGame from "../components/games/CalmGame";

const JOURNAL_QUESTIONS = [
  "What was one good thing that happened today?",
  "How did you feel most of the day? What emotions came up?",
  "What was challenging or stressful today?",
  "How did you handle stress or difficult moments?",
  "What are you grateful for today?",
];

export default function Activities() {
  const { user, setUser } = useContext(UserContext);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [toneResult, setToneResult] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const streamRef = useRef(null);
  const [activeGame, setActiveGame] = useState(null);
  const [journalMode, setJournalMode] = useState(null);
  const [writeText, setWriteText] = useState("");
  const [qaAnswers, setQaAnswers] = useState({});
  const [summary, setSummary] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");
  const audioRef = useRef(null);

  useEffect(() => () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
  }, [mediaRecorder]);

  async function startRecording() {
    if (!user?.permissions?.voice) {
      alert("Microphone permission not granted. Enable it in Permissions.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      const recordedChunks = [];
      mr.ondataavailable = (e) => recordedChunks.push(e.data);
      mr.onstop = async () => {
        try {
          stream.getTracks().forEach((t) => t.stop());
        } catch (e) {}
        const blob = new Blob(recordedChunks, { type: "audio/webm" });
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(blob);
          audioRef.current.load();
        }
        setToneResult("Analyzing...");
        try {
          const res = await analyzeAudioBlob(blob);
          if (res?.tone) {
            setToneResult(res.tone);
            setUser((prev) => ({ ...prev, situations: [...(prev.situations || []), `voice:${res.tone}`] }));
            setUploadingAudio(true);
            const uid = (user && (user.name || user.id)) || "anonymous";
            try {
              const { url: audioUrl, path } = await uploadAudioBlob(blob, uid, { rms: res.rms, zcr: res.zcr, tone: res.tone });
              const newItem = { url: audioUrl, path, rms: res.rms, zcr: res.zcr, tone: res.tone, date: new Date().toISOString() };
              setUser((prev) => ({ ...prev, audios: [...(prev.audios || []), newItem] }));
              saveUserProfile({ ...(user || {}), audios: [...((user && user.audios) || []), newItem] });
            } catch (uploadErr) {
              console.warn("Audio upload failed:", uploadErr);
            } finally {
              setUploadingAudio(false);
            }
          } else {
            setToneResult("Analysis failed");
          }
        } catch (err) {
          console.error("Audio analysis failed:", err);
          setToneResult("Error analyzing audio");
        }
      };
      mr.start();
      setMediaRecorder(mr);
      setRecording(true);
    } catch (err) {
      alert("Unable to start recording: " + (err?.message || err));
    }
  }

  function stopRecording() {
    if (mediaRecorder) {
      try {
        mediaRecorder.stop();
      } catch (e) {}
      setRecording(false);
    }
  }

  async function generateAISummary() {
    const answers = Object.values(qaAnswers).filter((a) => a && a.trim());
    if (!answers.length) {
      alert("Please answer at least one question.");
      return;
    }
    setSummary("Generating summary...");
    const openaiKey = typeof import.meta !== "undefined" ? import.meta.env.VITE_OPENAI_API_KEY : undefined;
    if (openaiKey) {
      try {
        const messages = [
          {
            role: "system",
            content:
              "You are a compassionate assistant. When given journal responses, produce a short (2-4 sentence) natural-language summary that paraphrases the user (do NOT repeat their answers verbatim or list Q/A). End with one empathetic insight and one concise, actionable suggestion.",
          },
          { role: "user", content: `User answers:\n${answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}` },
        ];
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
          body: JSON.stringify({ model: "gpt-3.5-turbo", messages, max_tokens: 220 }),
        });
        if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) {
          setSummary(text);
          return;
        }
      } catch (err) {
        console.warn("OpenAI failed, falling back:", err);
      }
    }

    // Local fallback paraphrase
    const content = answers.join(" ");
    const tone = /\b(anxious|worried|stressed|nervous|tense)\b/i.test(content)
      ? "tense or stressed"
      : /\b(happy|joy|excited|good|great|wonderful)\b/i.test(content)
      ? "positive"
      : /\b(calm|relaxed|peaceful|content)\b/i.test(content)
      ? "calm"
      : "mixed";

    const sentences = [];
    sentences.push(`It seems you experienced a ${tone} day, with both meaningful moments and challenges.`);
    if (answers[0]) sentences.push("You noticed something small that felt uplifting.");
    if (answers[2]) sentences.push("You encountered a difficulty but used some helpful strategies.");
    if (answers[4]) sentences.push("You identified things you are grateful for.");

    const insight =
      tone === "tense or stressed"
        ? "A brief breathing pause could help when tension rises."
        : tone === "positive"
        ? "Try to notice what supported the good moments and repeat it."
        : "Keep using the strategies that felt helpful today.";

    setSummary(`${sentences.slice(0, 2).join(" ")}\n\nInsight: ${insight}`);
  }

  function handleQAChange(index, value) {
    setQaAnswers((prev) => ({ ...prev, [index]: value }));
  }

  function saveJournal() {
    const journalEntry = {
      date: new Date().toLocaleDateString(),
      mode: journalMode,
      content: journalMode === "write" ? writeText : JSON.stringify(qaAnswers),
      summary,
    };

    setUser((prev) => ({ ...prev, journals: [...(prev.journals || []), journalEntry] }));
    setSavedMessage("✅ Journal saved to your profile!");
    setTimeout(() => setSavedMessage(""), 3000);
  }

  if (activeGame === "breathing") return (<div style={{ padding: "2rem" }}><button onClick={() => setActiveGame(null)} style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}>← Back to Activities</button><BreathingGame /></div>);
  if (activeGame === "calm") return (<div style={{ padding: "2rem" }}><button onClick={() => setActiveGame(null)} style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}>← Back to Activities</button><CalmGame /></div>);
  if (journalMode === "write") return (<div style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}><button onClick={() => { setJournalMode(null); setWriteText(""); }} style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}>← Back to Activities</button><h2>✍️ Free Writing</h2><p style={{ color: "#6b7280" }}>Write your thoughts and feelings freely.</p><textarea value={writeText} onChange={(e) => setWriteText(e.target.value)} placeholder="Start writing..." style={{ width: "100%", minHeight: 300, padding: "1rem", borderRadius: 8, border: "1px solid #d1d5db", marginBottom: "1rem" }} /><div style={{ display: "flex", gap: 8 }}><button onClick={saveJournal} disabled={!writeText.trim()}>💾 Save Journal</button><button onClick={() => setWriteText("")} style={{ background: "#f3f4f6", color: "#374151" }}>Clear</button></div>{savedMessage && <div style={{ marginTop: "1rem", color: "#10b981", fontWeight: 700 }}>{savedMessage}</div></div>);
  if (journalMode === "qa") return (<div style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}><button onClick={() => { setJournalMode(null); setQaAnswers({}); setSummary(null); }} style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}>← Back to Activities</button><h2>❓ Guided Reflection</h2>{!summary ? (<><p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>Answer these 5 questions about your day. Your answers will be analyzed to create a personalized summary.</p>{JOURNAL_QUESTIONS.map((q, i) => (<Card key={i} style={{ marginBottom: "1rem" }}><label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Q{i+1}. {q}</label><textarea value={qaAnswers[i] || ""} onChange={(e) => handleQAChange(i, e.target.value)} placeholder="Your answer..." style={{ width: "100%", minHeight: 80, padding: "0.75rem", borderRadius: 8, border: "1px solid #d1d5db" }} /></Card>))}<div style={{ display: "flex", gap: 8 }}><button onClick={generateAISummary}>🤖 Generate AI Summary</button><button onClick={() => setQaAnswers({})} style={{ background: "#f3f4f6", color: "#374151" }}>Clear All</button></div></>) : (<><Card style={{ padding: "1.5rem", background: "#f0fdf4", borderLeft: "4px solid #10b981" }}><div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{summary}</div></Card><div style={{ display: "flex", gap: 8, marginTop: "1.5rem" }}><button onClick={saveJournal}>💾 Save Journal with Summary</button><button onClick={() => setSummary(null)} style={{ background: "#f3f4f6", color: "#374151" }}>Regenerate</button></div>{savedMessage && <div style={{ marginTop: "1rem", color: "#10b981", fontWeight: 700 }}>{savedMessage}</div></>)}</div>);

  return (
    <div style={{ padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
      <h2>Activities</h2>

      <Card style={{ padding: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>🎤 Voice Check-In</h3>
        <p style={{ color: "#6b7280", marginBottom: "1rem" }}>Record your voice to analyze tone and upload for personalized insights.</p>

        <div style={{ background: "#f9fafb", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: "1rem" }}>
            {!recording ? (
              <button onClick={startRecording} style={{ flex: 1, padding: "12px 16px", background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>🔴 Start Recording</button>
            ) : (
              <button onClick={stopRecording} style={{ flex: 1, padding: "12px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>⏹ Stop Recording</button>
            )}
          </div>

          <audio ref={audioRef} controls style={{ width: "100%", borderRadius: 8, marginTop: "0.5rem" }} />
        </div>

        {toneResult && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              return (
                <div style={{ padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
                  <h2>Activities</h2>

                  <Card style={{ padding: "1.5rem" }}>
                    <h3 style={{ marginTop: 0 }}>🎤 Voice Check-In</h3>
                    <p style={{ color: "#6b7280", marginBottom: "1rem" }}>Record your voice to analyze tone and upload for personalized insights.</p>

                    <div style={{ background: "#f9fafb", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", gap: 12, marginBottom: "1rem" }}>
                        {!recording ? (
                          <button
                            onClick={startRecording}
                            style={{
                              flex: 1,
                              padding: "12px 16px",
                              background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
                              color: "white",
                              border: "none",
                              borderRadius: 8,
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: 14,
                            }}
                          >
                            🔴 Start Recording
                          </button>
                        ) : (
                          <button
                            onClick={stopRecording}
                            style={{
                              flex: 1,
                              padding: "12px 16px",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: 8,
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: 14,
                            }}
                          >
                            ⏹ Stop Recording
                          </button>
                        )}
                      </div>

                      <audio ref={audioRef} controls style={{ width: "100%", borderRadius: 8, marginTop: "0.5rem" }} />
                    </div>

                    {toneResult && (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                          {toneResult === "Analyzing..." ? (
                            <div style={{ color: "#666", fontSize: 13 }}>📊 Analyzing audio...</div>
                          ) : toneResult === "Error analyzing audio" ? (
                            <div style={{ color: "#ef4444", fontSize: 13 }}>❌ {toneResult}</div>
                          ) : (
                            <div style={{ color: "#374151", fontSize: 13 }}>
                              Detected tone: <strong style={{ color: toneResult === "calm" ? "#10b981" : toneResult === "tense" ? "#ef4444" : "#f59e0b" }}>{toneResult}</strong>
                            </div>
                          )}
                        </div>
                        {uploadingAudio && <div style={{ fontSize: 12, color: "#666" }}>📤 Uploading...</div>}
                      </div>
                    )}
                  </Card>

                  <Card style={{ marginTop: 12 }}>
                    <h3 style={{ marginTop: 0 }}>Mindfulness Games</h3>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => setActiveGame("breathing")}>🫁 Breathing Game</button>
                      <button onClick={() => setActiveGame("calm")}>🧘 Calm Game</button>
                    </div>
                  </Card>

                  <Card style={{ marginTop: 12 }}>
                    <h3 style={{ marginTop: 0 }}>📔 Journal</h3>
                    <p style={{ color: "#6b7280", marginBottom: "1rem" }}>Reflect on your day and capture your thoughts and feelings.</p>
                    <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                      <button onClick={() => setJournalMode("write")} style={{ textAlign: "left" }}>✍️ Write Freely</button>
                      <button onClick={() => setJournalMode("qa")} style={{ textAlign: "left" }}>❓ Guided Q&A</button>
                    </div>
                  </Card>
                </div>
              );
            }
        <button
          onClick={() => setActiveGame(null)}
          style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}
        >
          ← Back to Activities
        </button>
        <BreathingGame />
      </div>
    );
  }

  if (activeGame === 'calm') {
    return (
      <div style={{ padding: '2rem' }}>
        <button
          onClick={() => setActiveGame(null)}
          style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}
        >
          ← Back to Activities
        </button>
        <CalmGame />
      </div>
    );
  }

  if (journalMode === "write") {
    return (
      <div style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
        <button
          onClick={() => {
            setJournalMode(null);
            setWriteText("");
          }}
          style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}
        >
          ← Back to Activities
        </button>

        <h2>✍️ Free Writing</h2>
        <p style={{ color: "#6b7280" }}>Write your thoughts and feelings freely.</p>

        <textarea
          value={writeText}
          onChange={(e) => setWriteText(e.target.value)}
          placeholder="Start writing..."
          style={{
            width: "100%",
            minHeight: "300px",
            padding: "1rem",
            borderRadius: "0.5rem",
            border: "1px solid #d1d5db",
            fontFamily: "inherit",
            marginBottom: "1rem",
          }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveJournal} disabled={!writeText.trim()}>
            💾 Save Journal
          </button>
          <button
            onClick={() => setWriteText("")}
            style={{ background: "#f3f4f6", color: "#374151" }}
          >
            Clear
          </button>
        </div>

        {savedMessage && (
          <div style={{ marginTop: "1rem", color: "#10b981", fontWeight: "bold" }}>
            {savedMessage}
          </div>
        )}
      </div>
    );
  }

  if (journalMode === "qa") {
    return (
      <div style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
        <button
          onClick={() => {
            setJournalMode(null);
            setQaAnswers({});
            setSummary(null);
          }}
          style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}
        >
          ← Back to Activities
        </button>
        
        <h2>❓ Guided Reflection</h2>

            </p>
                <textarea
                    border: "1px solid #d1d5db",
                  }}
        <Card style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>🎤 Voice Check-In</h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Record your voice to analyze tone and upload for personalized insights.
          </p>
              <button
          <div style={{ background: '#f9fafb', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: '1rem' }}>
              {!recording ? (
                <button
                  onClick={startRecording}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  🔴 Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                    animation: 'pulse 1.5s infinite',
                  }}
                >
                  ⏹ Stop Recording
                </button>
              )}
            </div>
                onClick={() => setQaAnswers({})}
            <audio
              ref={audioRef}
              controls
              style={{
                width: '100%',
                borderRadius: 8,
                marginTop: '1rem',
              }}
            />
          </div>
                style={{ background: "#f3f4f6", color: "#374151" }}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {toneResult && (
              <>
                <div style={{ flex: 1 }}>
                  {toneResult === 'Analyzing...' ? (
                    <div style={{ color: '#666', fontSize: 13 }}>📊 Analyzing audio...</div>
                  ) : toneResult === 'Error analyzing audio' ? (
                    <div style={{ color: '#ef4444', fontSize: 13 }}>❌ {toneResult}</div>
                  ) : (
                    <div style={{ color: '#374151', fontSize: 13 }}>
                      Detected tone: <strong style={{ color: toneResult === 'calm' ? '#10b981' : toneResult === 'tense' ? '#ef4444' : '#f59e0b' }}>{toneResult}</strong>
                    </div>
                  )}
                </div>
                {uploadingAudio && <div style={{ fontSize: 12, color: '#666' }}>📤 Uploading...</div>}
              </>
            )}
          </div>
        </Card>
              >
                Clear All
              </button>
            </div>
          </>
        ) : (
          <>
            <Card style={{ padding: "1.5rem", background: "#f0fdf4", borderLeft: "4px solid #10b981" }}>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                {summary}
              </div>
            </Card>

            <div style={{ display: "flex", gap: 8, marginTop: "1.5rem" }}>
              <button onClick={saveJournal}>💾 Save Journal with Summary</button>
              <button
                onClick={() => setSummary(null)}
                style={{ background: "#f3f4f6", color: "#374151" }}
              >
                Regenerate
              </button>
            </div>

            {savedMessage && (
              <div style={{ marginTop: "1rem", color: "#10b981", fontWeight: "bold" }}>
                {savedMessage}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      <h2>Activities</h2>

      <Card>
        <h3 style={{ marginTop: 0 }}>Voice Check (record locally)</h3>
        <p style={{ color: '#6b7280' }}>
          Records audio locally and uploads anonymized analytics for improvements.
        </p>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {!recording ? (
            <button onClick={startRecording}>Start Recording</button>
          ) : (
            <button onClick={stopRecording}>Stop</button>
          )}

          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.play();
            }}
          >
            Play
          </button>
        </div>

        <audio ref={audioRef} controls style={{ marginTop: 12, width: '100%' }} />

        {toneResult && (
          <div style={{ marginTop: 10, color: '#374151' }}>
            Detected tone: <strong>{toneResult}</strong>
          </div>
        )}
      </Card>

      <Card style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Mindfulness Games</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setActiveGame('breathing')}>
            🫁 Breathing Game
          </button>
          <button onClick={() => setActiveGame('calm')}>🧘 Calm Game</button>
        </div>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>📔 Journal</h3>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Reflect on your day and capture your thoughts and feelings.
        </p>
        <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
          <button onClick={() => setJournalMode("write")} style={{ textAlign: 'left' }}>
            ✍️ Write Freely
          </button>
          <button onClick={() => setJournalMode("qa")} style={{ textAlign: 'left' }}>
            ❓ Guided Q&A
          </button>
        </div>
      </Card>
    </div>
  );
}
