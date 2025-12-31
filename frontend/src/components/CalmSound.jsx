import { useEffect } from "react";

export default function CalmSound({ mood }) {
  useEffect(() => {
    // Optional: Add calm.mp3 to public/sounds/ to enable audio
    // For now, audio is disabled until file is added
    /*
    const audio = new Audio("/sounds/calm.mp3");
    audio.loop = true;
    audio.volume = 0.35;
    audio.play();
    return () => audio.pause();
    */
  }, [mood]);

  return null;
}
