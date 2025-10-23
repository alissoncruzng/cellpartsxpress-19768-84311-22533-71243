// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyBaWvxWwjp7w8SgMKuD99Ug6rn9xtwQc4w",
  authDomain: "acr-delivery-8c1b6.firebaseapp.com",
  projectId: "acr-delivery-8c1b6",
  storageBucket: "acr-delivery-8c1b6.firebasestorage.app",
  messagingSenderId: "127433914855",
  appId: "1:127433914855:web:ff3415bfb5cb2db1902542"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'ACR Delivery';
  const notificationOptions = {
    body: payload.notification.body || 'Nova notificação',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    tag: payload.data?.orderId || 'default',
    requireInteraction: true,
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received.', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/driver/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
