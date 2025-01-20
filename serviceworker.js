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
  setTimeout(() => {
    fetch(event.request).then(response => {
      console.log('fetch event:', event);
      const headers = [];
      for (const [key, value] of event.request.headers.entries()) {
        headers.push(`${key}: ${value}`);
      }
      console.log('headers:', headers);
      console.log('response:', response);
      response.text().then(text => {
        console.log('response text:', text);
      });
    });
  }, 1000);
});

fetch('https://admin.hlx.page/status/andreituicu/hlx5test/main');
