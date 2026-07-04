import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  variable: "--font-instrument-serif",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Backlify — Enterprise PostgreSQL Backups",
  description: "Automated schedules, point-in-time recovery, and live monitoring. Five minutes to setup. A lifetime of peace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${jetBrainsMono.variable} antialiased`}
    >
      <body>{children}</body>
      {/* Trigger HMR */}
    </html>
  );
}
