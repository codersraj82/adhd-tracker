const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",

  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\/_next\/static\//,
      handler: "CacheFirst",
      options: {
        cacheName: "static-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
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
  ],
});

module.exports = withPWA({
  reactStrictMode: true,
});
