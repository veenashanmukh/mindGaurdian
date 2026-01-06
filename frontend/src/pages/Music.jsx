import Card from "../components/common/Card";
import { useEffect, useRef, useState } from "react";

const TRACKS = [
  { id: 'rain', title: 'Rain On Glass', desc: 'Nature Sounds', emoji: '🌧️', file: '/sounds/rain.mp3', duration: '4:32', color: '#667eea' },
  { id: 'ocean', title: 'Ocean Waves', desc: 'Relax', emoji: '🌊', file: '/sounds/ocean.mp3', duration: '5:18', color: '#764ba2' },
  { id: 'birds', title: 'Forest Birds', desc: 'Focus', emoji: '🐦', file: '/sounds/birds.mp3', duration: '3:45', color: '#f093fb' },
  { id: 'piano', title: 'Soft Piano Dreams', desc: 'Meditate', emoji: '🎹', file: '/sounds/piano.mp3', duration: '6:22', color: '#4facfe' },
];

export default function Music() {
  const audioRef = useRef(null);
  const [current, setCurrent] = useState(TRACKS[0]);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      const pct = (audio.currentTime / (audio.duration || 1)) * 100;
      setProgress(pct);
      const mins = Math.floor(audio.currentTime / 60);
      const secs = Math.floor(audio.currentTime % 60);
      setCurrentTime(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    const onEnd = () => setPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
    };
  }, [current]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing, current]);

  function selectTrack(t) {
    setCurrent(t);
    setProgress(0);
    setCurrentTime('0:00');
    setPlaying(true);
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>🎵 Calming Playlist</h2>
      <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>Unwind with curated ambient sounds</p>

      <Card style={{ padding: '2rem', background: `linear-gradient(135deg, ${current.color}22 0%, ${current.color}11 100%)`, border: `2px solid ${current.color}33` }}>
        {/* Album Art */}
        <div style={{
          width: 280,
          height: 280,
          margin: '0 auto',
          borderRadius: 24,
          background: `linear-gradient(135deg, ${current.color}, ${current.color}dd)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 120,
          boxShadow: `0 20px 60px ${current.color}40`,
          marginBottom: '2rem',
        }}>
          {current.emoji}
        </div>

        {/* Track Info */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: '0.5rem' }}>{current.title}</div>
          <div style={{ color: '#7c3aed', fontSize: 14, fontWeight: 600 }}>{current.desc}</div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            height: 6,
            background: '#e5e7eb',
            borderRadius: 12,
            overflow: 'hidden',
            cursor: 'pointer',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${current.color}, ${current.color}dd)`,
              transition: 'width 0.1s linear',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
            <div>{currentTime}</div>
            <div>{current.duration}</div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <button
            onClick={() => setPlaying((p) => !p)}
            style={{
              padding: '14px 32px',
              borderRadius: 28,
              background: `linear-gradient(135deg, ${current.color}, ${current.color}dd)`,
              color: 'white',
              border: 'none',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: `0 10px 20px ${current.color}40`,
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = `0 15px 30px ${current.color}60`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = `0 10px 20px ${current.color}40`;
            }}
          >
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>

        <audio ref={audioRef} src={current.file} preload="metadata" />
      </Card>

      {/* Up Next Queue */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#111827' }}>Up Next</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {TRACKS.map((t) => (
            <div
              key={t.id}
              onClick={() => selectTrack(t)}
              style={{
                background: current.id === t.id ? `${t.color}15` : '#fff',
                border: current.id === t.id ? `2px solid ${t.color}` : '1px solid #e5e7eb',
                borderRadius: 16,
                padding: '16px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: current.id === t.id ? `0 8px 20px ${t.color}20` : '0 2px 8px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                if (current.id !== t.id) {
                  e.currentTarget.style.borderColor = `${t.color}60`;
                  e.currentTarget.style.background = `${t.color}08`;
                }
              }}
              onMouseLeave={(e) => {
                if (current.id !== t.id) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#fff';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <div style={{ fontSize: 28 }}>{t.emoji}</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#111827' }}>{t.title}</div>
                  <div style={{ color: '#6b7280', fontSize: 13 }}>{t.desc}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 500 }}>{t.duration}</div>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: current.id === t.id ? t.color : '#f3f4f6',
                  color: current.id === t.id ? 'white' : '#374151',
                  fontSize: 12,
                  fontWeight: 600,
                  minWidth: 50,
                  textAlign: 'center',
                }}>
                  {current.id === t.id ? (playing ? '♫ Playing' : 'Current') : 'Play'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
