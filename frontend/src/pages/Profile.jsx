import { getCoins } from "../utils/rewards";
import { getLevel } from "../utils/levels";
import { getStreak } from "../ai/streakEngine";
import MoodTrend from "../components/MoodTrend";
import { getBadges } from "../utils/badges";

export default function Profile() {
  const coins = getCoins();
  const level = getLevel(coins);
  const streak = getStreak();
  const badges = getBadges(coins, streak);

  return (
    <div style={wrap}>
      <h2>My Growth 🌱</h2>

      <div style={card}>
        <p>Level</p>
        <h1>{level}</h1>
      </div>

      <div style={row}>
        <div style={mini}>🪙 {coins} Calm Coins</div>
        <div style={mini}>🌿 {streak} day streak</div>
      </div>

      <div style={badgeWrap}>
        {badges.map((b,i)=>(
          <div key={i} style={badge}>{b}</div>
        ))}
      </div>

      <MoodTrend />

      <div style={tree}>
        {level === "Seed" && "🌱"}
        {level === "Sprout" && "🌿"}
        {level === "Bloom" && "🌳"}
        {level === "Zen Master" && "🌸"}
      </div>

      <p style={tip}>Your calm garden grows as you take care of yourself.</p>
    </div>
  );
}

const wrap = {
  minHeight: "100vh",
  padding: 24,
  background: "linear-gradient(135deg,#fdfcf5,#dff3e8,#c7edd7)",
  color: "#204030"
};

const card = {
  background: "#fff",
  padding: 26,
  borderRadius: 22,
  textAlign: "center",
  boxShadow: "0 16px 40px rgba(120,200,140,.4)",
};

const row = {
  display: "flex",
  gap: 12,
  marginTop: 18,
};

const mini = {
  flex: 1,
  background: "#fff",
  padding: 14,
  borderRadius: 16,
  textAlign: "center",
};

const tree = {
  fontSize: 80,
  textAlign: "center",
  marginTop: 28,
};

const tip = {
  textAlign: "center",
  marginTop: 10,
  color: "#5a8f73",
};

const badgeWrap = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 16
};

const badge = {
  background: "#fff",
  padding: "8px 14px",
  borderRadius: 14,
  boxShadow: "0 8px 22px rgba(140,200,150,.35)",
  fontSize: 13
};
