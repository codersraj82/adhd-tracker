/** @type {import('next').NextConfig} */

// 🔥 Runtime caching rules (FINAL optimized)
const runtimeCaching = [
  // 1. Pages (HTML navigation)
  {
    urlPattern: ({ request }) => request.destination === "document",
    handler: "NetworkFirst",
    options: {
      cacheName: "pages-cache",
      networkTimeoutSeconds: 3, // fallback quickly when offline
    },
  },

  // 2. JS / CSS / Worker (CRITICAL for offline app logic)
  {
    urlPattern: ({ request }) =>
      ["script", "style", "worker"].includes(request.destination),
    handler: "CacheFirst", // 🔥 ensures offline JS works
    options: {
      cacheName: "assets-cache",
      expiration: {
        maxEntries: 100,
      },
    },
  },

  // 3. Images
  {
    urlPattern: ({ request }) => request.destination === "image",
    handler: "CacheFirst",
    options: {
      cacheName: "images-cache",
      expiration: {
        maxEntries: 50,
      },
    },
  },

  // 4. Sounds (important for your ADHD app)
  {
    urlPattern: /\/sounds\/.*$/,
    handler: "CacheFirst",
    options: {
      cacheName: "sound-cache",
      expiration: {
        maxEntries: 10,
      },
    },
  },
];

// 🔥 PWA setup
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  clientsClaim: true, // activate new SW immediately

  // Disable PWA in development
  disable: process.env.NODE_ENV === "development",

  runtimeCaching,

  // Offline fallback page
  fallbacks: {
    document: "/offline",
  },
});

module.exports = withPWA({
  reactStrictMode: true,
});
