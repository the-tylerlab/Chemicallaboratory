// Service Worker with Web Push and Quick Approval Support
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Cache bypass fetch handler
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

// ========================================================
// WEB PUSH NOTIFICATION HANDLER
// ========================================================
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'แจ้งเตือนระบบห้องแล็บ', body: event.data.text() };
    }
  }

  const title = data.title || '🔬 มีคำขอใหม่รอการอนุมัติ';
  const options = {
    body: data.body || 'มีรายการคำขอใหม่จากนักเรียนในระบบ',
    icon: data.icon || '/favicon.svg',
    badge: data.badge || '/favicon.svg',
    tag: data.tag || ('lab-request-' + Date.now()),
    data: data.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: data.actions || [
      { action: 'approve', title: '✅ อนุมัติทันที' },
      { action: 'view', title: '🔍 ดูรายละเอียด' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ========================================================
// NOTIFICATION CLICK / ACTION HANDLER
// ========================================================
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const payloadData = notification.data || {};

  notification.close();

  if (action === 'approve') {
    // Background Quick-Approve
    event.waitUntil(
      fetch('/api/quick-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadData)
      })
      .then(async (response) => {
        const result = await response.json();
        if (result.success) {
          return self.registration.showNotification('✅ อนุมัติสำเร็จ', {
            body: result.message || 'อนุมัติคำขอในระบบและตัดสต็อกเรียบร้อยแล้ว',
            icon: '/favicon.svg',
            tag: 'approve-success-' + Date.now()
          });
        } else {
          return self.registration.showNotification('⚠️ ไม่สามารถอนุมัติได้', {
            body: result.error || 'เกิดข้อผิดพลาดในการอนุมัติคำขอ',
            icon: '/favicon.svg',
            tag: 'approve-fail-' + Date.now()
          });
        }
      })
      .catch((err) => {
        return self.registration.showNotification('❌ เกิดข้อผิดพลาด', {
          body: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (' + (err.message || 'Error') + ')',
          icon: '/favicon.svg'
        });
      })
    );
  } else {
    // Default click or 'view' action: Open or focus application window
    const targetUrl = payloadData.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({
              type: 'NAVIGATE_TO_REQUEST',
              requestId: payloadData.id,
              requestType: payloadData.type
            });
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
    );
  }
});
