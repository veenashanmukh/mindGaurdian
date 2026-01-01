import { ReactMic } from "react-mic";
import { useState } from "react";

export default function VoiceCheck({ onClose }) {
  const [record, setRecord] = useState(false);

  const onStop = (rec) => {
    localStorage.setItem("voiceUsed","true");
    onClose();
  };

  return (
    <div style={overlay}>
      <div style={card}>
        <h3>How are you feeling?</h3>
        <p>Speak freely for 30 seconds.</p>

        <ReactMic
          record={record}
          onStop={onStop}
          strokeColor="#5DB075"
          backgroundColor="#000"
        />

        <button style={btn} onClick={()=>setRecord(!record)}>
          {record ? "Stop" : "Start"}
        </button>
      </div>
    </div>
  );
}

const overlay={position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center"};
const card={background:"#fff",borderRadius:22,padding:26,width:300,textAlign:"center"};
const btn={marginTop:14,padding:12,borderRadius:12,background:"#5DB075",border:"none",color:"#fff"};
