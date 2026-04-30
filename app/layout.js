import "./globals.css";

export const metadata = {
  title: "Get It Done",
  description: "Get It Done — Focus. Finish. Feel better.",
  manifest: "/manifest.json",
  themeColor: "#facc15", // match manifest
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* PWA Manifest (IMPORTANT for install prompt) */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color */}
        <meta name="theme-color" content="#facc15" />

        {/* iOS PWA support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Get It Done" />

        {/* iOS icon */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* Viewport (fixed) */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body>{children}</body>
    </html>
  );
}
