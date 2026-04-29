import "./globals.css";

export const metadata = {
  title: "Get It Done",
  manifest: "/manifest.json",
  description: "Get It Done — Focus. Finish. Feel better.",
  themeColor: "#0f172a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* iOS PWA support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Get It Done" />

        {/* viewport control */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Get It Done" />
      </head>
      <body>{children}</body>
    </html>
  );
}
