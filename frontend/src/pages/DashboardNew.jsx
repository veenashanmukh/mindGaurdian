import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import Card from "../components/common/Card";
import WellnessScore from "../components/dashboard/WellnessScore";
import Suggestions from "../components/dashboard/Suggestions";
import MoodSummary from "../components/dashboard/MoodSummary";
import { inferWellnessScore } from "../logic/stressInference";
import { personalizeSuggestions } from "../logic/personalization";
import { getUpcomingEvents, getEventEmoji, formatEventTime } from "../services/calendarService";
import { generatePersonalizedForecast } from "../logic/forecastInference";

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [emotionalForecast, setEmotionalForecast] = useState([]);

  const score = inferWellnessScore(user);
  const suggestions = personalizeSuggestions(user?.energy || 50);

  useEffect(() => {
    // Generate personalized forecast based on user data
    setEmotionalForecast(generatePersonalizedForecast(user));

    (async () => {
      try {
        const result = await getUpcomingEvents(3);
        if (result?.ok) {
          setUpcomingEvents(result.events.map((e) => ({ id: e.id, title: e.title, time: formatEventTime(e.start), emoji: getEventEmoji(e.title) })));
        }
      } catch (e) {
        // ignore, keep empty
      }
    })();
  }, [user]);

  const reflections = (user?.situations || []).slice(-3).map((s, i) => ({ id: i, title: s, body: '' }));

  const smallStats = [
    { label: 'Session balance', value: 78 },
    { label: 'Sleep', value: '7.2h' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18 }}>
        <div>
          <Card style={{ padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>📊 7-Day Emotional Forecast</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              {(emotionalForecast.length > 0 ? emotionalForecast : []).map((d) => (
                <div key={d.day} style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 12, background: d.highlight ? '#fff7fe' : '#f8fafc' }}>
                  <div style={{ fontSize: 28 }}>{d.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{d.day}</div>
                  <div style={{ fontSize: 11, opacity: 0.9 }}>{d.label}</div>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            {smallStats.map((s, i) => (
              <div key={i} style={{ background: '#f8fafc', padding: 14, borderRadius: 12, flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{s.value}</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <Card>
              <h3 style={{ marginTop: 0 }}>Today’s gentle suggestions</h3>
              <Suggestions items={suggestions} />
            </Card>
          </div>
        </div>

        <div>
          <Card style={{ padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>📅 Your Schedule</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingEvents.length ? upcomingEvents.map((evt) => (
                <div key={evt.id} style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 10, padding: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ fontSize: 20 }}>{evt.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{evt.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>{evt.time}</div>
                  </div>
                </div>
              )) : <div style={{ color: '#9ca3af' }}>No upcoming events</div>}
            </div>
          </Card>

          <div style={{ marginTop: 12 }}>
            <Card>
              <h3 style={{ marginTop: 0 }}>Reflections</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reflections.length ? reflections.map((r) => (
                  <div key={r.id} style={{ background: '#f8fafc', padding: 12, borderRadius: 12 }}>
                    <div style={{ fontWeight: 700 }}>{r.title}</div>
                    <div style={{ color: '#6b7280', fontSize: 14 }}>{r.body}</div>
                  </div>
                )) : <div style={{ color: '#9ca3af' }}>No reflections yet — add one after your day.</div>}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
