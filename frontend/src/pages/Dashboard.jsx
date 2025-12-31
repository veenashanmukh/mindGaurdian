
import MoodWeather from "../components/MoodWeather";

import { storeDay, getPattern } from "../ai/dayMemory";
import { getStreak } from "../utils/streak";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DailyReflection from "./DailyReflection";

import NightReflection from "../components/NightReflection";
import GratitudeGarden from "../components/GratitudeGarden";
import { useState } from "react";
import BreathingGame from "../components/games/BreathingGame";
import FocusBooster from "../components/games/FocusBooster";
import { getCoins } from "../utils/rewards";
import { getLevel } from "../utils/levels";
import { simulateStressWeek } from "../utils/demoMode";
import VoiceCheck from "../components/VoiceCheck";

export default function Dashboard() {
  const navigate = useNavigate();
  
  const mood = localStorage.getItem("userMood");
  const isTired = mood === "Tired";
  const isStressed = mood === "Stressed";
  const pattern = getPattern();
  const streak = getStreak();
  const coins = getCoins();
  const level = getLevel(coins);
  useEffect(() => {
    if (mood) storeDay(mood);
  }, []);

  const [showGame, setShowGame] = useState(false);
  const [showFocus, setShowFocus] = useState(false);
  const [showGarden, setShowGarden] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
const [showNight, setShowNight] = useState(false);
const [showReflection, setShowReflection] = useState(false);

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>
  Good Morning 👋 <span style={{ color: "#5DB075" }}>
    {localStorage.getItem("userName") || "Friend"}
  </span>
</h1>

            <div style={{ color:"#5DB075", marginBottom:10 }}>
              🪙 Calm Coins: {coins}
            </div>
            <div style={{ color: "#9fffc9", marginBottom: 12 }}>Level: {level}</div>

      <div style={streakBox}>
        🌱 {streak} day calm streak
      </div>

      <button
        style={{marginBottom:10, padding: "10px 16px", borderRadius: 12, background: "#5DB075", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500}}
        onClick={()=>{
          simulateStressWeek();
          window.location.reload();
        }}
      >
        🎥 Demo Stress Week
      </button>

      <div
        style={styles.card}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <p style={styles.score}>Daily Wellness Score</p>
        <h2 style={styles.big}>{mood === "Stressed" ? "58" : "78"} / 100</h2>
        <p style={styles.tag}>{mood} day expected</p>
      </div>

      {pattern === "STRESS_PATTERN" && (
        <div style={burnoutBox}>
          ⚠️ Your recent days look heavy.  
          Tomorrow should be kept gentle.
        </div>
      )}

      <div style={styles.section}>
        <h3>
          {isStressed && "Let's slow things down 🌙"}
          {isTired && "Let's gently recharge 🌿"}
          {mood === "Calm" && "Today's Gentle Suggestions"}
          {mood === "Okay" && "Today's Gentle Suggestions"}
        </h3>

        <div style={styles.grid}>

          {isStressed && (
            <div style={styles.box} onClick={() => setShowGame(true)}>
              3-min breathing
            </div>
          )}

          {isTired && (
            <div style={styles.box}>
              5-min body stretch
            </div>
          )}

          {mood === "Okay" && (
            <div style={styles.box} onClick={() => setShowFocus(true)}>
              Focus booster
            </div>
          )}

          {mood === "Calm" && (
            <div style={styles.box} onClick={() => setShowGarden(true)}>
              Gratitude garden
            </div>
          )}

          <div style={styles.box} onClick={() => setShowVoice(true)}>
            Voice Check-in 🎤
          </div>

          <div style={styles.box} onClick={() => navigate("/profile")}>
            My Growth 🌱
          </div>

        </div>

        <MoodWeather />

        <button
          style={{ marginTop: 20, padding: 12, borderRadius: 12, background: "#5DB075", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500 }}
          onClick={() => setShowNight(true)}
        >
          {isStressed || isTired ? "Just one gentle thought 🌙" : "View Today's Reflection 🌙"}
        </button>
      </div>
      {showGame && <BreathingGame onClose={() => setShowGame(false)} />}
      {showFocus && <FocusBooster onClose={() => setShowFocus(false)} />}
      {showGarden && <GratitudeGarden onClose={() => setShowGarden(false)} />}
      {showVoice && <VoiceCheck onClose={() => setShowVoice(false)} />}
      {showNight && <NightReflection onClose={() => setShowNight(false)} />}
        {showReflection && <DailyReflection onClose={()=>setShowReflection(false)} />}

      <div style={fab} onClick={() => setShowGame(true)}>＋</div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    padding: 24,
    background: "radial-gradient(circle at top, #1f2d2b, #0c0f0e)",
    backdropFilter: "blur(14px)",
    color: "#fff",
    fontFamily: "system-ui",
  },

  title: {
    fontSize: 28,
    fontWeight: 600,
    marginBottom: 20,
  },

  card: {
    background: "#ffffff",
    borderRadius: 22,
    padding: 26,
    color: "#111",
    maxWidth: 420,
    boxShadow: "0 20px 40px rgba(0,0,0,.35)",
    border: "1px solid rgba(255,255,255,.08)",
    transition: "all .3s ease",
  },

  score: {
    color: "#777",
    fontSize: 14,
  },

  big: {
    fontSize: 44,
    margin: "6px 0",
    fontWeight: 600,
  },

  tag: {
    color: "#5DB075",
    fontWeight: 500,
    marginTop: 4,
  },

  section: {
    marginTop: 40,
    maxWidth: 420,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    marginTop: 16,
  },

  box: {
    background: "#ffffff",
    color: "#111",
    padding: 16,
    borderRadius: 16,
    textAlign: "center",
    fontWeight: 500,
    boxShadow: "0 6px 16px rgba(0,0,0,.25)",
    cursor: "pointer",
  },
};

const burnoutBox = {
  marginTop: 16,
  background: "#2b1c1c",
  padding: 16,
  borderRadius: 16,
  color: "#ffbdbd",
  maxWidth: 420,
  fontSize: 14,
};

const streakBox = {
  margin: "10px 0 18px",
  background: "#1f2d2b",
  padding: "8px 14px",
  borderRadius: 20,
  display: "inline-block",
  fontSize: 13,
  color: "#9fffc9"
};

const fab = {
  position: "fixed",
  bottom: 24,
  right: 24,
  width: 60,
  height: 60,
  borderRadius: 30,
  background: "#5DB075",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 34,
  boxShadow: "0 10px 30px rgba(93,176,117,.6)",
  cursor: "pointer"
};
