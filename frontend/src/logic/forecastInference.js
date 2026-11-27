// Analyze user's past audio tones, journals, and situational data to generate a personalized 7-day forecast

const TONE_TO_EMOJI = {
  calm: { emoji: '😌', label: 'Calm' },
  tense: { emoji: '😰', label: 'Stressed' },
  neutral: { emoji: '🙂', label: 'Content' },
  positive: { emoji: '😊', label: 'Happy' },
  reflective: { emoji: '🌧️', label: 'Reflective' },
};

const DEFAULT_FORECAST = [
  { day: 'Mon', emoji: '😌', label: 'Calm' },
  { day: 'Tue', emoji: '😊', label: 'Happy' },
  { day: 'Wed', emoji: '🙂', label: 'Content' },
  { day: 'Thu', emoji: '😰', label: 'Stressed', highlight: true },
  { day: 'Fri', emoji: '🌧️', label: 'Reflective', highlight: true },
  { day: 'Sat', emoji: '😴', label: 'Rest Day' },
  { day: 'Sun', emoji: '⚡', label: 'Energized' },
];

export function generatePersonalizedForecast(user) {
  if (!user) return DEFAULT_FORECAST;

  // Analyze recent audio tones
  // Voice check-ins and energy check-ins both feed the forecast
  const energyTone = { low: 'reflective', normal: 'neutral', high: 'positive' };
  const recentTones = [
    ...(user.audios || []).map((a) => a.tone || 'neutral'),
    ...(user.checkIns || []).map((c) => (c.kind === 'voice' ? c.value : energyTone[c.value] || 'neutral')),
  ].slice(-14);
  const toneFreq = {};
  recentTones.forEach((t) => {
    toneFreq[t] = (toneFreq[t] || 0) + 1;
  });
  const dominantTone = Object.keys(toneFreq).sort((a, b) => toneFreq[b] - toneFreq[a])[0] || 'neutral';

  // Analyze journal moods (simple keyword detection)
  const journalMoods = [...(user.journals || []), ...(user.reflections || [])].slice(-10).map((j) => {
    const content = (j.summary || j.content || j.text || '').toLowerCase();
    if (/\b(happy|joy|excited|great|wonderful|good)\b/.test(content)) return 'positive';
    if (/\b(stressed|anxious|worried|tense|difficult)\b/.test(content)) return 'tense';
    if (/\b(calm|peaceful|relaxed|content)\b/.test(content)) return 'calm';
    if (/\b(reflect|think|wonder|ponder)\b/.test(content)) return 'reflective';
    return 'neutral';
  });

  // Count mood frequencies
  const moodFreq = {};
  journalMoods.forEach((m) => {
    moodFreq[m] = (moodFreq[m] || 0) + 1;
  });

  // Detect weekly patterns: Thursdays & Fridays tend to be more stressed/reflective
  const today = new Date().getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate forecast for next 7 days
  const forecast = [];
  for (let i = 0; i < 7; i++) {
    const dayIdx = (today + i) % 7;
    const dayName = days[dayIdx];

    let mood = dominantTone;
    let isHighlight = false;

    // Apply weekly patterns
    if (dayIdx === 4 || dayIdx === 5) {
      // Thu/Fri: more likely stressed/reflective
      mood = moodFreq['tense'] > moodFreq['positive'] ? 'tense' : moodFreq['reflective'] > 0 ? 'reflective' : mood;
      isHighlight = true;
    } else if (dayIdx === 6 || dayIdx === 0) {
      // Sat/Sun: more relaxed
      mood = moodFreq['calm'] > 0 ? 'calm' : 'positive';
    }

    // Vary mood slightly based on pattern (cycle through sentiments)
    const moodOptions = Object.keys(moodFreq).sort((a, b) => moodFreq[b] - moodFreq[a]);
    if (moodOptions.length > 1) {
      mood = moodOptions[i % moodOptions.length] || mood;
    }

    const emojiData = TONE_TO_EMOJI[mood] || TONE_TO_EMOJI.neutral;
    forecast.push({
      day: dayName,
      emoji: emojiData.emoji,
      label: emojiData.label,
      highlight: isHighlight,
    });
  }

  return forecast.length > 0 ? forecast : DEFAULT_FORECAST;
}
