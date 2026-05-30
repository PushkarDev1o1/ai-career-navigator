import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Career Navigator - Discover Your Path",
  description: "Assess your skills, interests, and preferences to receive a personalized AI-powered career roadmap using Gemini and Firebase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className="glow-bg glow-indigo"></div>
        <div className="glow-bg glow-purple"></div>
        {children}
      </body>
    </html>
  );
}
