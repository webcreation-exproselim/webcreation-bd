// Service worker for Live Chat Admin App push notifications
self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  const title = data.title || "নতুন মেসেজ";
  const options = {
    body: data.body || "",
    icon: "/logo.png",
    badge: "/logo.png",
    tag: data.tag || "chat",
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: { url: data.url || "/chat-app" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/chat-app";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const c of clients) {
        if (c.url.includes("/chat-app")) { c.focus(); c.navigate(url); return; }
      }
      return self.clients.openWindow(url);
    })
  );
});
