"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface LanguageContextType {
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  translateText: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "agribloom-language";
const CACHE_KEY = "agribloom-translation-cache";
const CACHE_VERSION = 1;

// Module-level cache (survives client-side navigations)
const memoryCache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

// Hydrate from localStorage once.
let hydrated = false;
function hydrateCache() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { v: number; entries: [string, string][] };
    if (parsed.v !== CACHE_VERSION) return;
    for (const [k, v] of parsed.entries) memoryCache.set(k, v);
  } catch {
    // ignore corrupted cache
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSave() {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const entries = [...memoryCache.entries()].slice(-3000); // bound size
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ v: CACHE_VERSION, entries })
      );
    } catch {
      // quota exceeded — drop silently
    }
  }, 500);
}

async function fetchTranslation(text: string, targetLang: string): Promise<string> {
  const key = `${targetLang}:${text}`;
  const cached = memoryCache.get(key);
  if (cached) return cached;

  const existing = inflight.get(key);
  if (existing) return existing;

  const p = (async () => {
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang }),
      });
      if (!res.ok) return text;
      const data = await res.json();
      const translated: string = data.translated || text;
      memoryCache.set(key, translated);
      scheduleSave();
      return translated;
    } catch {
      return text;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, p);
  return p;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [selectedLanguage, setSelectedLanguageState] = useState("en");

  // Hydrate from localStorage + user profile
  useEffect(() => {
    hydrateCache();

    let cancelled = false;
    // 1. Try profile (most authoritative for logged-in users)
    fetch("/api/users/profile", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        const fromProfile = data?.data?.preferredLanguage;
        const fromStorage = localStorage.getItem(STORAGE_KEY);
        const next = fromProfile || fromStorage || "en";
        if (next && next !== "en") setSelectedLanguageState(next);
      })
      .catch(() => {
        const fromStorage = localStorage.getItem(STORAGE_KEY);
        if (fromStorage && fromStorage !== "en") setSelectedLanguageState(fromStorage);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on change: localStorage immediately, profile fire-and-forget
  const setSelectedLanguage = useCallback((lang: string) => {
    setSelectedLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    // Persist to profile if logged in (silently ignore failure)
    fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ preferredLanguage: lang }),
    }).catch(() => {});
  }, []);

  const translateText = useCallback(
    async (text: string): Promise<string> => {
      if (selectedLanguage === "en" || !text) return text;
      return fetchTranslation(text, selectedLanguage);
    },
    [selectedLanguage]
  );

  return (
    <LanguageContext.Provider
      value={{ selectedLanguage, setSelectedLanguage, translateText }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

/** Direct import for the <T> component to share the same cache + dedup. */
export const __translation_internals__ = {
  fetchTranslation,
  hydrateCache,
};
