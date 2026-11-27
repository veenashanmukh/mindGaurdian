export function sendTestNotification(title, options = {}) {
  try {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    new Notification(title, options);
  } catch (err) {
    console.error('Notification error', err);
  }
}
