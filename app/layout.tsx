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
  title: {
    default: "MarkSlide - Markdown to Slides",
    template: "%s | MarkSlide",
  },
  description: "Transform your Markdown into beautiful presentation slides with AI-powered content generation and Chanel-inspired design.",
  keywords: ["markdown", "slides", "presentation", "marp", "AI", "gemini"],
  authors: [{ name: "MarkSlide" }],
  creator: "MarkSlide",
  metadataBase: new URL('https://markslide.teaboard.link'),
  openGraph: {
    title: "MarkSlide - Markdown to Slides",
    description: "Transform your Markdown into beautiful presentation slides with AI-powered content generation and Chanel-inspired design.",
    type: "website",
    locale: "ko_KR",
    siteName: "MarkSlide",
  },
  twitter: {
    card: "summary_large_image",
    title: "MarkSlide - Markdown to Slides",
    description: "Transform your Markdown into beautiful presentation slides with AI-powered content generation and Chanel-inspired design.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
