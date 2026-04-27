import "./globals.css";

export const metadata = {
  title: "ADHD Tracker",
  description: "A simple offline-first ADHD task tracker.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
