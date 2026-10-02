// Zack Finance — Service Worker
const CACHE = 'zf-v1';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Receive push from server (future use with VAPID backend)
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Zack Finance', {
      body: data.body || '',
      icon: '/assets/zack-mascot.png',
      badge: '/assets/zack-mascot.png',
      tag: data.tag || 'zf',
      data,
    })
  );
});

// Message from app → SW → show notification (works even when tab is not focused)
self.addEventListener('message', e => {
  if (e.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag } = e.data;
    self.registration.showNotification(title, {
      body,
      icon: '/assets/zack-mascot.png',
      badge: '/assets/zack-mascot.png',
      tag: tag || 'zf-bill',
      requireInteraction: false,
      vibrate: [200, 100, 200],
    });
  }
});

// Click → open app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(cs => {
    const c = cs.find(c => c.url.includes(self.location.origin));
    return c ? c.focus() : clients.openWindow('/');
  }));
});
