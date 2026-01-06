/**
 * Determines app mode based on user permissions.
 * This keeps the app permission-light by design.
 */
export function determineMode({ voice, screenTime, wearable }) {
  if (wearable) {
    return "advanced";
  }

  if (voice || screenTime) {
    return "enhanced";
  }

  return "baseline";
}
