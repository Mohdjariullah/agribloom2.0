"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ChatPanel from "./ChatPanel";

// Hidden on auth/onboarding routes and on the landing page (where the
// Chatbase widget takes over for visitors who aren't signed in yet).
const HIDDEN_EXACT = new Set(["/", "/login", "/signup", "/verifyemail", "/chat"]);
const HIDDEN_PREFIXES = ["/complete-profile", "/edit-profile"];

export default function ChatLauncher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (HIDDEN_EXACT.has(pathname)) return null;
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p + "/") || pathname === p)) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[min(560px,75vh)] rounded-2xl border border-stone-200 shadow-2xl overflow-hidden bg-white"
          >
            <ChatPanel variant="widget" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-4 sm:right-6 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-105"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </>
  );
}
