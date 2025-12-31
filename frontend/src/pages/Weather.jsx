import MoodWeather from "../components/MoodWeather";

export default function Weather() {
  return (
    <div style={wrap}>
      <h2>Your Mood Week 🌦</h2>
      <MoodWeather />
    </div>
  );
}

const wrap = {
  minHeight: "100vh",
  padding: 24,
  background: "linear-gradient(135deg,#fdfcf5,#dff3e8,#c7edd7)",
  color: "#204030",
  paddingBottom: 80
};
