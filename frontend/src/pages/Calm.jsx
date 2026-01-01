import BreathingGame from "../components/games/BreathingGame";
import GratitudeGarden from "../components/GratitudeGarden";
import FocusBooster from "../components/games/FocusBooster";
import { useState } from "react";

export default function Calm() {
  const [show, setShow] = useState(null);

  return (
    <div style={wrap}>
      <h2>Calm Activities</h2>

      <div style={grid}>
        <div style={box} onClick={()=>setShow("breath")}>🫁 Breathing</div>
        <div style={box} onClick={()=>setShow("focus")}>🎯 Focus</div>
        <div style={box} onClick={()=>setShow("garden")}>🌱 Gratitude</div>
      </div>

      {show==="breath" && <BreathingGame onClose={()=>setShow(null)} />}
      {show==="focus" && <FocusBooster onClose={()=>setShow(null)} />}
      {show==="garden" && <GratitudeGarden onClose={()=>setShow(null)} />}
    </div>
  );
}

const wrap = {
  minHeight: "100vh",
  padding: 24,
  background: "linear-gradient(135deg,#fdfcf5,#dff3e8,#c7edd7)",
  color: "#204030"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
  marginTop: 18
};

const box = {
  background: "#fff",
  padding: 18,
  borderRadius: 18,
  textAlign: "center",
  boxShadow: "0 10px 28px rgba(140,200,150,.35)"
};
