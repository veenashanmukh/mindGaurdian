export default function MoodWeather() {
  const history = JSON.parse(localStorage.getItem("dayHistory")) || [];

  const icons = {
    Calm: "☀️",
    Okay: "⛅",
    Tired: "�️",
    Stressed: "🌧️"
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h3 style={{ marginBottom: 10 }}>Your Week at a Glance</h3>

      <div style={{ display: "flex", gap: 12 }}>
        {history.map((d, i) => (
          <div key={i} style={box}>
            <div style={{ fontSize: 28 }}>{icons[d.mood]}</div>
            <div style={{ fontSize: 11, opacity: .7 }}>
              {new Date(d.time).toLocaleDateString("en-US", { weekday: "short" })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const box = {
  background: "#fff",
  color: "#111",
  padding: 12,
  borderRadius: 12,
  textAlign: "center",
  width: 48,
};
