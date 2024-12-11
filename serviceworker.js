// Install event
self.addEventListener('install', event => {
  console.log('Service Worker installed.');
});

// Activate event
self.addEventListener('activate', event => {
  console.log('Service Worker activated.');
});

// Fetch event
self.addEventListener('fetch', event => {
  console.log('fetch event:', event);
  const headers = [];
  for (const [key, value] of event.request.headers.entries()) {
    headers.push(`${key}: ${value}`);
  }
  console.log(headers);
});