import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Self-hosted at build time, so it renders the same on every device and there
// is no swap flash mid-question.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Music Trainer",
  description: "Daily theory drilling for the 5-unit Bagrut track.",
  appleWebApp: { capable: true, title: "Trainer", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh bg-ground text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
