import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { inferWellnessScore } from "../logic/stressInference";
import { personalizeSuggestions } from "../logic/personalization";
import BreathingGame from "../components/games/BreathingGame";
import CalmGame from "../components/games/CalmGame";
import WellnessScore from "../components/dashboard/WellnessScore";
import Suggestions from "../components/dashboard/Suggestions";
import MoodSummary from "../components/dashboard/MoodSummary";
import Card from "../components/common/Card";
import { isFirebaseAvailable } from "../services/firebase";
import { trackDashboardViewed } from "../services/analyticsService";
import { getUpcomingEvents, getEventEmoji, formatEventTime } from "../services/calendarService";

const EMOTIONAL_FORECAST = [
  { day: 'Mon', emoji: '😌', label: 'Calm' },
  { day: 'Tue', emoji: '😊', label: 'Happy' },
  { day: 'Wed', emoji: '🙂', label: 'Content' },
  { day: 'Thu', emoji: '😰', label: 'Stressed', highlight: true },
  { day: 'Fri', emoji: '🌧️', label: 'Reflective', highlight: true },
  { day: 'Sat', emoji: '😴', label: 'Rest Day' },
  { day: 'Sun', emoji: '⚡', label: 'Energized' },
];

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showCalm, setShowCalm] = useState(false);
  const [showTfDemo, setShowTfDemo] = useState(false);
  const [TfComponent, setTfComponent] = useState(null);
  const [gtagAvailable, setGtagAvailable] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, title: 'Team Standup', time: '10:00 AM', emoji: '👥' },
    { id: 2, title: 'Lunch with Sarah', time: '12:30 PM', emoji: '🍽️' },
  ]);

  const score = inferWellnessScore(user);
  const suggestions = personalizeSuggestions(user.energy);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setGtagAvailable(Boolean(window.gtag));
    }
    // Track dashboard view (anonymous)
    try { trackDashboardViewed(); } catch (e) {}

    // Fetch real calendar events if available
    (async () => {
      const result = await getUpcomingEvents(2);
      if (result.ok && result.events.length > 0) {
        const formatted = result.events.map((evt) => ({
          id: evt.id,
          title: evt.title,
          time: formatEventTime(evt.start),
          emoji: getEventEmoji(evt.title),
        }));
        setUpcomingEvents(formatted);
      }
      // Otherwise keep default demo events
    })();
  }, []);

  // Lazy-load TF demo only when user requests it
  const handleShowTfDemo = async () => {
    if (!TfComponent) {
      const mod = await import("../ai/TfDemo");
      setTfComponent(() => mod.default);
    }
        {/* Left Column - Stress Management & Suggestions */}
        <div>
          <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 20px 40px rgba(2,6,23,0.06)' }}>

  // sample small stats for the left card to match inspiration
  const smallStats = [
                <div style={{ color: '#6b7280', marginTop: 6 }}>Overview of your day</div>
    { label: 'Session balance', value: 78 },
    { label: 'Sleep', value: '7.2h' },
  ];

  // create reflection items from user.situations for demo
  const reflections = (user.situations || []).slice(-3).map((s, i) => ({
    id: i,
            <div style={{ display: 'flex', gap: 16, marginTop: 18, alignItems: 'center' }}>
              <div style={{ width: 160, height: 160, borderRadius: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'conic-gradient(#7c3aed 0%, #f472b6 60%, #e6e6e9 60%)' }}>
                <div style={{ width: 100, height: 100, borderRadius: 100, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>{score}</div>

  // Upcoming appointments/events from calendar
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    { id: 2, title: 'Lunch with Sarah', time: '12:30 PM', emoji: '🍽️' },
                    <div key={i} style={{ background: '#f8fafc', padding: 12, borderRadius: 10, textAlign: 'left' }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{s.value}</div>
                      <div style={{ color: '#6b7280', fontSize: 12 }}>{s.label}</div>
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      {/* Emotional Forecast */}
      <div style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 20, padding: '2rem', color: 'white' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: 20, fontWeight: 700 }}>📊 7-Day Emotional Forecast</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
          {EMOTIONAL_FORECAST.map((day, idx) => (
            <div
              key={idx}
              style={{
                <div style={{ color: '#6b7280', fontSize: 12 }}>4 of 4 days</div>
                border: day.highlight ? '2px solid rgba(255,255,255,0.4)' : 'none',
              <div style={{ height: 6, background: '#fff', borderRadius: 8, marginTop: 10 }}>
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg,#7c3aed,#f472b6)', borderRadius: 8 }} />
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: '0.5rem' }}>{day.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: '0.5rem' }}>{day.day}</div>
              <div style={{ fontSize: 11, opacity: 0.9 }}>{day.label}</div>
            </div>
          ))}
        </div>
      </div>

        {/* Right Column - Reflections & Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Reflections */}
          <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: '0 20px 40px rgba(2,6,23,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Reflections</h3>
              <button style={{ background: 'linear-gradient(90deg,#7c3aed,#ec4899)', color: 'white', borderRadius: 16, padding: '8px 12px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Add New</button>
              <div>
                <h2 style={{ margin: 0 }}>Stress Management</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              </div>
                <div key={r.id} style={{ background: '#f8fafc', padding: 12, borderRadius: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{r.title}</div>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>{r.body}</div>
              </div>
            </div>
                <div style={{ color: '#9ca3af', fontSize: 13 }}>No reflections yet — add one after your day.</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 18, alignItems: 'center' }}>
              <div style={{ width: 200, height: 200, borderRadius: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'conic-gradient(#7c3aed 0%, #f472b6 60%, #e6e6e9 60%)' }}>
                <div style={{ width: 120, height: 120, borderRadius: 120, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>{score}</div>

          {/* Upcoming Schedule */}
          <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: 16, padding: '1.5rem', color: 'white' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: 16, fontWeight: 700 }}>📅 Your Schedule</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingEvents.map((evt) => (
                <div key={evt.id} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 20 }}>{evt.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{evt.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>{evt.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ marginTop: '1rem', width: '100%', padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>View Full Calendar</button>
          </div>
              </div>

              <div style={{ flex: 1 }}>
    </div>
                  {smallStats.map((s, i) => (
                    <div key={i} style={{ background: '#f8fafc', padding: 14, borderRadius: 12, flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{s.value}</div>
                      <div style={{ color: '#6b7280', fontSize: 13 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 18, background: '#fff7fe', padding: 12, borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>Mindfulness This Week</div>
                    <div style={{ color: '#6b7280', fontSize: 12 }}>4 of 4 days</div>
                  </div>
                  <div style={{ height: 8, background: '#fff', borderRadius: 8, marginTop: 10 }}>
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg,#7c3aed,#f472b6)', borderRadius: 8 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <Card>
              <h3 style={{ marginTop: 0 }}>Today’s gentle suggestions</h3>
              <Suggestions items={suggestions} />
            </Card>
          </div>
        </div>

        <div>
          <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: '0 20px 40px rgba(2,6,23,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Reflections</h3>
              <button style={{ background: 'linear-gradient(90deg,#7c3aed,#ec4899)', color: 'white', borderRadius: 16, padding: '8px 12px' }}>+ Add New</button>
            </div>

            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reflections.length ? reflections.map((r) => (
                <div key={r.id} style={{ background: '#f8fafc', padding: 12, borderRadius: 12 }}>
                  <div style={{ fontWeight: 700 }}>{r.title}</div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>{r.body}</div>
                </div>
              )) : (
                <div style={{ color: '#9ca3af' }}>No reflections yet — add one after your day.</div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
