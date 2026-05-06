"use client";

import { useEffect, useState } from "react";
import { useLanguage, __translation_internals__ } from "@/contexts/LanguageContext";

const { fetchTranslation, hydrateCache } = __translation_internals__;

/**
 * Wrap any English string in <T>...</T> to have it auto-translated to the
 * user's preferred language. The English original ships in the markup, so
 * the page is readable instantly; the translation swaps in once it arrives
 * (cached in memory + localStorage for instant subsequent renders).
 *
 * Example:
 *   <T>Welcome back</T>
 *   <h1><T>Today’s mandi prices</T></h1>
 *
 * Inside JSX you can pass interpolated text — but it must be a single string.
 * For multi-part strings build the string up and pass it as a single child.
 */
export function T({ children }: { children: string }) {
  const { selectedLanguage } = useLanguage();
  const [text, setText] = useState(children);

  useEffect(() => {
    hydrateCache();

    if (selectedLanguage === "en" || !children) {
      setText(children);
      return;
    }

    let cancelled = false;
    fetchTranslation(children, selectedLanguage).then((translated) => {
      if (!cancelled) setText(translated);
    });

    return () => {
      cancelled = true;
    };
  }, [children, selectedLanguage]);

  return <>{text}</>;
}
