import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

import ConditionalNavbar from "./ConditionalNavbar";
import SiteTopBar from "@/components/SiteTopBar";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ChatWidget } from "@/components/ChatWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Loaded so Devanagari (Hindi) renders correctly even on Windows / Android
// browsers that don't ship a built-in Hindi font. Used implicitly via the
// font-stack on body.
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgriBloom — Smart farming, made simple",
  description:
    "Crop guides, live mandi prices, weather, pest control and fertilizer schedules — built for Indian farmers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoDevanagari.variable}`}
    >
      <body
        className="bg-white text-stone-900 antialiased"
        style={{
          fontFamily:
            "var(--font-inter), var(--font-noto-devanagari), system-ui, sans-serif",
        }}
      >
        <LanguageProvider>
          <SiteTopBar />
          <ConditionalNavbar />
          <div className="min-h-screen">{children}</div>
          <Toaster position="top-center" reverseOrder={false} />
          {/* Single chat assistant for the whole site: the Chatbase embed. */}
          <ChatWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
