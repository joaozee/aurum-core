export const showNotification = async (title, body, url = '/') => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: { url },
      actions: [{ action: 'open', title: 'Abrir' }]
    });
  } catch (err) {
    console.log('Notification error:', err);
  }
};