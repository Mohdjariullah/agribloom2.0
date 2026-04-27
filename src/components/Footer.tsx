"use client";

import Link from "next/link";
import { Mail, MapPin, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "bn", name: "বাংলা" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ml", name: "മലയാളം" },
  { code: "mr", name: "मराठी" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
];

export default function Footer() {
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-50 border-t border-stone-200 text-stone-700">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold text-stone-900 mb-3">
            {t("footer.agribloom") || "AgriBloom"}
          </h2>
          <p className="text-sm leading-relaxed text-stone-600">
            Practical farming tools for Indian growers — crop info, market rates,
            weather and pest guidance, in one place.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h3 className="text-sm font-semibold text-stone-900 mb-4 uppercase tracking-wider">
            Explore
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li><FooterLink href="/agrilens">Crops</FooterLink></li>
            <li><FooterLink href="/insect">Pests &amp; diseases</FooterLink></li>
            <li><FooterLink href="/fertilizer">Fertilizer</FooterLink></li>
            <li><FooterLink href="/mandi-prices">Mandi prices</FooterLink></li>
            <li><FooterLink href="/weather">Weather</FooterLink></li>
            <li><FooterLink href="/schemes">Govt schemes</FooterLink></li>
          </ul>
        </div>

        {/* Sources */}
        <div>
          <h3 className="text-sm font-semibold text-stone-900 mb-4 uppercase tracking-wider">
            Data sources
          </h3>
          <ul className="space-y-2.5 text-sm text-stone-600">
            <li>data.gov.in (AGMARKNET)</li>
            <li>OpenWeatherMap</li>
            <li>ICAR &amp; Krishi Vigyan Kendras</li>
            <li>State agriculture universities</li>
          </ul>
        </div>

        {/* Language + contact */}
        <div>
          <h3 className="text-sm font-semibold text-stone-900 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Language
          </h3>
          <div className="grid grid-cols-2 gap-1.5 mb-6">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`text-left text-xs px-2 py-1.5 rounded-md transition-colors ${
                  selectedLanguage === lang.code
                    ? "bg-green-100 text-green-800 font-medium"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
          <h3 className="text-sm font-semibold text-stone-900 mb-3 uppercase tracking-wider">
            Contact
          </h3>
          <div className="space-y-2 text-sm text-stone-600">
            <a href="mailto:hello@agribloom.in" className="flex items-center gap-2 hover:text-green-700 transition-colors">
              <Mail className="w-4 h-4" /> hello@agribloom.in
            </a>
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> India
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-stone-500">
          <p>© {year} AgriBloom. All rights reserved.</p>
          <p>
            <Link href="/contactus" className="hover:text-green-700 transition-colors">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-stone-600 hover:text-green-700 transition-colors"
    >
      {children}
    </Link>
  );
}
