"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES } from "@/lib/languages";
import { T } from "@/components/T";

// Real number to be supplied by the user; placeholder until then.
const HELPLINE_PLACEHOLDER = "1800-XXX-XXXX";
const HELPLINE_HREF = "tel:1800XXXXXXX";

export function TopUtilityStrip() {
  return (
    <>
      {/* Tricolour hairline — the single strongest "Government of India" cue */}
      <div aria-hidden className="flex h-1">
        <span className="flex-1 bg-[#FF9933]" />
        <span className="flex-1 bg-white" />
        <span className="flex-1 bg-[#138808]" />
      </div>
      <div className="bg-green-800 text-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between text-[12px]">
          {/* Eyebrow follows the site language: English shows English, Hindi
              shows Hindi, etc. (translated at runtime via <T>). */}
          <p className="truncate text-white">
            <T>For India&apos;s farmers</T>
          </p>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <a
              href={HELPLINE_HREF}
              className="inline-flex items-center gap-1.5 text-green-50 hover:text-white transition-colors font-medium"
              aria-label="Helpline number"
            >
              <Phone className="w-3 h-3" />
              <span>{HELPLINE_PLACEHOLDER}</span>
            </a>
            <span className="hidden sm:inline-block text-green-600">|</span>
            <LanguagePill />
          </div>
        </div>
      </div>
    </>
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
        className="inline-flex items-center gap-1 text-green-50 hover:text-white transition-colors px-1.5 py-0.5 rounded"
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
