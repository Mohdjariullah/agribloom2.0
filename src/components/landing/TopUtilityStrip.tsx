"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES } from "@/lib/languages";

// Real number to be supplied by the user; placeholder until then.
const HELPLINE_PLACEHOLDER = "1800-XXX-XXXX";
const HELPLINE_HREF = "tel:1800XXXXXXX";

export function TopUtilityStrip() {
  return (
    <div className="bg-stone-900 text-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between text-[12px]">
        <p className="text-stone-300 truncate">
          <span className="hidden sm:inline">For India&apos;s farmers · </span>
          <span lang="hi" className="text-stone-200">भारत के किसानों के लिए</span>
        </p>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <a
            href={HELPLINE_HREF}
            className="hidden sm:inline-flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors"
            aria-label="Helpline number"
          >
            <Phone className="w-3 h-3" />
            <span>{HELPLINE_PLACEHOLDER}</span>
          </a>
          <span className="hidden sm:inline-block text-stone-700">|</span>
          <LanguagePill />
        </div>
      </div>
    </div>
  );
}

function LanguagePill() {
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current =
    LANGUAGES.find((l) => l.code === selectedLanguage)?.name ?? "English";

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        className="inline-flex items-center gap-1 text-stone-300 hover:text-white transition-colors px-1.5 py-0.5 rounded"
      >
        <Globe className="w-3 h-3" />
        <span>{current}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 bg-white text-stone-900 border border-stone-200 shadow-lg rounded-xl p-2 z-50 min-w-[240px] grid grid-cols-2 gap-1">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setSelectedLanguage(l.code);
                setOpen(false);
              }}
              className={`text-left text-xs px-2 py-1.5 rounded transition-colors ${
                selectedLanguage === l.code
                  ? "bg-green-700 text-white"
                  : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
