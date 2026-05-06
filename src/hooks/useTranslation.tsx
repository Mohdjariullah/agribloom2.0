"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import translations from "@/data/translations.json";

type TranslationDict = Record<string, Record<string, unknown>>;

const dict = translations as unknown as TranslationDict;

function readDottedKey(obj: unknown, path: string[]): string | undefined {
  let cur: unknown = obj;
  for (const k of path) {
    if (cur && typeof cur === "object" && k in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
}

export function useTranslation() {
  const { selectedLanguage } = useLanguage();
  const [translationCache, setTranslationCache] = useState<Record<string, string>>({});

  // Lookup from the static JSON dictionary, falling back to English then to the key.
  const getStaticTranslation = (key: string): string => {
    const path = key.split(".");
    return (
      readDottedKey(dict[selectedLanguage], path) ??
      readDottedKey(dict.en, path) ??
      key
    );
  };

  // Translate arbitrary text via the API (cached per-call).
  const getDynamicTranslation = async (text: string): Promise<string> => {
    if (selectedLanguage === "en" || !text) return text;

    const cacheKey = `${selectedLanguage}:${text}`;
    if (translationCache[cacheKey]) return translationCache[cacheKey];

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: selectedLanguage }),
      });
      if (response.ok) {
        const data = await response.json();
        const translated: string = data.translated || text;
        setTranslationCache((prev) => ({ ...prev, [cacheKey]: translated }));
        return translated;
      }
    } catch (err) {
      console.error("Translation failed:", err);
    }
    return text;
  };

  const t = (key: string): string => getStaticTranslation(key);
  const translate = (text: string): Promise<string> => getDynamicTranslation(text);

  return { t, translate, language: selectedLanguage };
}
