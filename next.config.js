/** @type {import('next').NextConfig} */

// Runtime caching rules (optimized)
const runtimeCaching = [
  // 1. Pages (HTML navigation)
  {
    urlPattern: ({ request }) => request.destination === "document",
    handler: "NetworkFirst",
    options: {
      cacheName: "pages-cache",
      expiration: {
        maxEntries: 50,
      },
    },
  },

  // 2. JS / CSS assets
  {
    urlPattern: ({ request }) =>
      ["script", "style", "worker"].includes(request.destination),
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "assets-cache",
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

// PWA setup
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,

  // Disable in dev (IMPORTANT)
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
