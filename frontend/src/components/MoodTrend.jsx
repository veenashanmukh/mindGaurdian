import { LineChart, Line, XAxis, Tooltip } from "recharts";

export default function MoodTrend() {
  const raw = JSON.parse(localStorage.getItem("dayHistory")) || [];

  const map = { Calm: 4, Okay: 3, Tired: 2, Stressed: 1 };

  const data = raw.map(d => ({
    day: new Date(d.time).toLocaleDateString("en-US",{weekday:"short"}),
    value: map[d.mood]
  }));

  return (
    <div style={wrap}>
      <h3>Your Emotional Flow</h3>
      <LineChart width={300} height={180} data={data}>
        <XAxis dataKey="day"/>
        <Tooltip/>
        <Line type="monotone" dataKey="value"/>
      </LineChart>
    </div>
  );
}

const wrap = {
  background: "#fff",
  padding: 18,
  borderRadius: 18,
  boxShadow: "0 12px 32px rgba(140,200,150,.35)"
};
