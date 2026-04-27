import type { Metadata } from "next";
import "./globals.css";

import ConditionalNavbar from "./ConditionalNavbar";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ChatLauncher from "@/components/ChatLauncher";

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
    <html lang="en">
      <body className="bg-white text-stone-900 antialiased">
        <LanguageProvider>
          <ConditionalNavbar />
          <div className="min-h-screen">{children}</div>
          <Toaster position="top-center" reverseOrder={false} />
          <ChatLauncher />
        </LanguageProvider>
      </body>
    </html>
  );
}