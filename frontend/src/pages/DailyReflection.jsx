export default function DailyReflection({ onClose }) {
  const mood = localStorage.getItem("userMood") || "Okay";

  const reflections = {
    Calm: "Today felt steady and light. Small calm habits will keep your day smooth 🌿",
    Okay: "You handled today well. A little rest will refresh your energy ✨",
    Tired: "Your energy seemed low today. Rest and gentle care will help 🌙",
    Stressed: "Today felt heavy. You showed strength by continuing 🤍"
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h2>Today’s Reflection</h2>
        <p style={styles.text}>{reflections[mood]}</p>
        <button style={styles.btn} onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

const styles = {
  overlay:{
    position:"fixed", inset:0, background:"rgba(0,0,0,.7)",
    display:"flex", justifyContent:"center", alignItems:"center",
    animation: "slideUp .4s ease"
  },
  card:{
    background:"#fff", padding:28, borderRadius:24,
    maxWidth:340, textAlign:"center"
  },
  text:{ margin:"18px 0", color:"#333", fontSize:16 },
  btn:{ background:"#5DB075", border:0, color:"#fff", padding:"12px 28px",
    borderRadius:14, cursor:"pointer"}
};
