import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const item = (path, icon, label) => (
    <div
      onClick={() => nav(path)}
      style={{
        flex: 1,
        textAlign: "center",
        padding: 10,
        color: pathname === path ? "#5DB075" : "#999"
      }}
    >
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 11 }}>{label}</div>
    </div>
  );

  return (
    <div style={bar}>
      {item("/", "🏠", "Home")}
      {item("/weather", "🌦", "Weather")}
      {item("/calm", "🎮", "Calm")}
      {item("/profile", "🌱", "Profile")}
    </div>
  );
}

const bar = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  background: "#ffffff",
  display: "flex",
  boxShadow: "0 -10px 30px rgba(140,200,150,.35)",
  borderTopLeftRadius: 22,
  borderTopRightRadius: 22
};
