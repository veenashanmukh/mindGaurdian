// Firebase Analytics wrapper
// - Uses Firebase Analytics only (no gtag or other providers)
// - Tracks a small set of anonymous events and strips any PII
// - Fails silently when Analytics is not available
import { analytics } from "./firebase";
import { logEvent } from "firebase/analytics";

const FORBIDDEN_KEYS = ["name", "email", "age", "userId", "user_id", "ssn"];

function sanitizeParams(params = {}) {
  const out = {};
  Object.keys(params || {}).forEach((k) => {
    if (FORBIDDEN_KEYS.includes(k)) return; // drop personally identifying keys
    const v = params[k];
    // only allow primitive values
    if (v === null) return;
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    }
  });
  return out;
}

export function trackEvent(name, params = {}) {
  try {
    if (!analytics) {
      // analytics not configured; fail silently but log for local dev
      // eslint-disable-next-line no-console
      console.log("analytics: (noop)", name, sanitizeParams(params));
      return;
    }

    const safe = sanitizeParams(params);
    logEvent(analytics, name, safe);
    // Also emit a console log for proof during demos (safe, sanitized)
    // This helps when DebugView doesn't show events immediately.
    // eslint-disable-next-line no-console
    console.log("analytics: event sent", name, safe);
  } catch (err) {
    // Never throw from analytics
    // eslint-disable-next-line no-console
    console.warn("analytics error (ignored)", err?.message || err);
  }
}

// Event helpers — UI components should call these functions
export function trackOnboardingComplete() {
  trackEvent("onboarding_complete");
}

export function trackSituationalCheckCompleted() {
  trackEvent("situational_check_completed");
}

export function trackDashboardViewed() {
  trackEvent("dashboard_viewed");
}

// Accepts suggestion label and internally maps to a type (game / breathing / music / other)
export function trackSuggestionUsed(label = "") {
  const l = (label || "").toLowerCase();
  let type = "other";
  if (l.includes("breath")) type = "breathing";
  else if (l.includes("music")) type = "music";
  else if (l.includes("game")) type = "game";
  else if (l.includes("walk") || l.includes("walk")) type = "activity";

  trackEvent("suggestion_used", { type });
}
