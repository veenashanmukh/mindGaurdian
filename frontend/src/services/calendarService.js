// Google Calendar integration service
// Requires: Google Calendar API setup in Google Cloud Console
// And OAuth 2.0 Client ID added to Vite env: VITE_GOOGLE_CALENDAR_API_KEY and VITE_GOOGLE_CALENDAR_CLIENT_ID

const CALENDAR_API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let gapiLoaded = false;
let authToken = null;

// Initialize Google API client
export async function initializeGoogleCalendar() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init({
            apiKey: CALENDAR_API_KEY,
            clientId: CLIENT_ID,
            scope: SCOPES,
            discoveryDocs: [
              'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
            ],
          });
          gapiLoaded = true;
          resolve(true);
        } catch (err) {
          console.error('Failed to initialize Google Calendar API:', err);
          resolve(false);
        }
      });
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Sign in with Google (if not already authenticated)
export async function signInToGoogle() {
  if (!gapiLoaded) {
    const initialized = await initializeGoogleCalendar();
    if (!initialized) return { ok: false, error: 'Google API not available' };
  }

  try {
    const auth = window.gapi.auth2.getAuthInstance();
    if (!auth.isSignedIn.get()) {
      await auth.signIn();
    }
    const user = auth.currentUser.get();
    authToken = user.getAuthResponse().id_token;
    return { ok: true, user };
  } catch (err) {
    console.error('Google sign-in failed:', err);
    return { ok: false, error: err.message };
  }
}

// Fetch upcoming events from Google Calendar
export async function getUpcomingEvents(maxResults = 5) {
  if (!gapiLoaded) {
    const initialized = await initializeGoogleCalendar();
    if (!initialized) return { ok: false, events: [], error: 'API not initialized' };
  }

  try {
    const auth = window.gapi.auth2.getAuthInstance();
    if (!auth.isSignedIn.get()) {
      return { ok: false, events: [], error: 'Not signed in' };
    }

    const response = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = (response.result.items || []).map((evt) => ({
      id: evt.id,
      title: evt.summary || 'Untitled',
      start: evt.start.dateTime || evt.start.date,
      end: evt.end.dateTime || evt.end.date,
      description: evt.description,
    }));

    return { ok: true, events };
  } catch (err) {
    console.error('Failed to fetch calendar events:', err);
    return { ok: false, events: [], error: err.message };
  }
}

// Format time for display
export function formatEventTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', meridiem: 'short' });
}

// Get emoji for event type (heuristic based on title)
export function getEventEmoji(title) {
  const lower = (title || '').toLowerCase();
  if (lower.includes('meeting') || lower.includes('standup')) return '👥';
  if (lower.includes('lunch') || lower.includes('breakfast') || lower.includes('dinner')) return '🍽️';
  if (lower.includes('exercise') || lower.includes('gym') || lower.includes('yoga')) return '🏃';
  if (lower.includes('meditation') || lower.includes('mindfulness')) return '🧘';
  if (lower.includes('doctor') || lower.includes('dentist') || lower.includes('appointment')) return '🏥';
  if (lower.includes('birthday') || lower.includes('celebration')) return '🎉';
  if (lower.includes('call') || lower.includes('zoom') || lower.includes('webinar')) return '📞';
  return '📅';
}
