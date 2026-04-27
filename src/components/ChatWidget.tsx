"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    chatbase?: {
      (...args: unknown[]): unknown;
      q?: unknown[];
      [key: string]: unknown;
    };
  }
}

/**
 * Loads the Chatbase widget for the landing page.
 * Chatbase renders its own floating bubble — we just inject the script.
 */
export function ChatWidget() {
  useEffect(() => {
    // Skip if already initialized
    if (typeof window === "undefined") return;
    if (window.chatbase && window.chatbase("getState") === "initialized") return;

    const stub = ((...args: unknown[]) => {
      stub.q = stub.q || [];
      stub.q.push(args);
    }) as Window["chatbase"] & { q?: unknown[] };
    stub.q = [];

    window.chatbase = new Proxy(stub, {
      get(target, prop: string) {
        if (prop === "q") return target.q;
        return (...args: unknown[]) => target(prop, ...args);
      },
    }) as Window["chatbase"];

    const existing = document.getElementById("ZmcgdIA6RpyzhDjOF_ahr");
    if (existing) return;

    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.id = "ZmcgdIA6RpyzhDjOF_ahr";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return null;
}
