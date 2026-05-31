import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  CloudSun,
  Sprout,
  Bug,
  FlaskConical,
  Landmark,
  Languages,
  IndianRupee,
  Phone,
} from "lucide-react";
import Footer from "@/components/Footer";
import { T } from "@/components/T";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { MobileCTABar } from "@/components/landing/MobileCTABar";

export default function Home() {
  return (
    <>
      <main className="bg-stone-50 text-stone-800 pb-24 sm:pb-0">
        <Hero />
        <TrustStrip />
        <Features />
        <HowItWorks />
        <SchemesHighlight />
        <LanguageStrip />
        <Footer />
      </main>
      {/* Tricolour hairline closes the page, mirroring the top */}
      <div aria-hidden className="flex h-1">
        <span className="flex-1 bg-[#FF9933]" />
        <span className="flex-1 bg-white" />
        <span className="flex-1 bg-[#138808]" />
      </div>
      <MobileCTABar />
    </>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────
 * Data + trust, not decoration. Tricolour-accented card on the left,
 * three flat "public service" stat blocks on the right (the credible
 * stand-in for hero photography).
 * ─────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="bg-green-50/70 border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left — message + CTAs */}
          <div className="lg:col-span-7 border-l-4 border-amber-500 pl-5 sm:pl-7">
            <p className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-3">
              <T>A free public service for Indian farmers</T>
            </p>
            <h1 className="text-[28px] sm:text-4xl lg:text-[44px] font-bold text-green-900 leading-[1.15] mb-4">
              <T>Today&apos;s mandi prices, weather alerts, and crop help —</T>{" "}
              <span className="text-green-700">
                <T>free, in your language.</T>
              </span>
            </h1>
            <p className="text-[17px] sm:text-lg text-stone-700 leading-relaxed max-w-2xl mb-7">
              <T>
                Wholesale prices, crop guides, pest control, fertilizer schedules and government
                schemes — all in one place. No fees, no jargon.
              </T>
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/mandi-prices"
                className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white text-base font-semibold rounded-xl px-6 min-h-[52px] transition-colors shadow-sm"
              >
                <IndianRupee className="w-5 h-5" />
                <T>Check today&apos;s prices</T>
              </Link>
              <Link
                href="/weather"
                className="inline-flex items-center justify-center gap-2 border-2 border-green-700 text-green-800 hover:bg-green-700 hover:text-white text-base font-semibold rounded-xl px-6 min-h-[52px] transition-colors"
              >
                <CloudSun className="w-5 h-5" />
                <T>Weather for my area</T>
              </Link>
            </div>

            <p className="mt-5 text-sm text-stone-600 flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-700" />
              <T>Need help? Call our toll-free helpline — 1800-XXX-XXXX</T>
            </p>
          </div>

          {/* Right — three flat trust/stat blocks */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-3">
            <Stat value="3,000+" label="Mandis covered" />
            <Stat value="Daily" label="Price updates" />
            <Stat value="10" label="Languages" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white border border-green-100 rounded-xl px-3 py-5 text-center shadow-sm">
      <p className="text-2xl sm:text-3xl font-bold text-green-800 leading-none mb-1.5">{value}</p>
      <p className="text-xs sm:text-sm text-stone-600 leading-tight">
        <T>{label}</T>
      </p>
    </div>
  );
}

/* ── Features ───────────────────────────────────────────────────────
 * Chunky icon tiles — the pattern every Indian govt/agri portal uses.
 * Low density, big tap area, one plain verb-led line each.
 * ─────────────────────────────────────────────────────────────────── */
function Features() {
  const items = [
    { icon: TrendingUp, title: "Mandi prices", line: "Today's wholesale rates near you", href: "/mandi-prices", accent: "border-l-green-700" },
    { icon: CloudSun, title: "Weather + crop alerts", line: "Rain, heat and spray warnings", href: "/weather", accent: "border-l-green-700" },
    { icon: Sprout, title: "Crop guides", line: "Season, soil and water for your crop", href: "/agrilens", accent: "border-l-green-700" },
    { icon: Bug, title: "Pest control", line: "Spot it, treat it, save the crop", href: "/insect", accent: "border-l-green-700" },
    { icon: FlaskConical, title: "Fertilizer schedules", line: "What to apply, and when", href: "/fertilizer", accent: "border-l-green-700" },
    { icon: Landmark, title: "Government schemes", line: "Subsidies you can claim", href: "/schemes", accent: "border-l-amber-500" },
  ];
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-green-900 mb-2">
          <T>What you can do</T>
        </h2>
        <p className="text-stone-600 text-[15px] sm:text-base mb-8 max-w-2xl">
          <T>Everything a farmer needs to make the next decision — in one place.</T>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <Link
                key={it.title}
                href={it.href}
                className={`group bg-white border border-green-100 ${it.accent} border-l-4 rounded-xl p-5 hover:shadow-md hover:border-green-200 transition-all flex items-start gap-4 min-h-[96px]`}
              >
                <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-700 group-hover:bg-green-100 transition-colors">
                  <Icon className="w-6 h-6" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-stone-900 mb-0.5 flex items-center gap-1.5">
                    <T>{it.title}</T>
                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-green-700 group-hover:translate-x-0.5 transition-all" />
                  </h3>
                  <p className="text-[15px] text-stone-600 leading-snug">
                    <T>{it.line}</T>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── How it works ───────────────────────────────────────────────────
 * The zero-friction, no-login reassurance every govt portal leads with.
 * ─────────────────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n: 1, title: "Pick your language", line: "Hindi, Tamil, Telugu, Kannada and more." },
    { n: 2, title: "Choose your district & crop", line: "We tailor prices and weather to you." },
    { n: 3, title: "Get prices, weather & advice", line: "Free — no sign-up needed to read." },
  ];
  return (
    <section className="bg-green-50/70 border-y border-green-100 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-green-900 mb-8 text-center">
          <T>How it works</T>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-700 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                {s.n}
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1">
                <T>{s.title}</T>
              </h3>
              <p className="text-[15px] text-stone-600 leading-snug">
                <T>{s.line}</T>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Schemes highlight ──────────────────────────────────────────────
 * Leans hardest into the government-affiliation cue.
 * ─────────────────────────────────────────────────────────────────── */
function SchemesHighlight() {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-amber-200 border-l-4 border-l-amber-500 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <span className="flex-shrink-0 w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Landmark className="w-7 h-7" strokeWidth={1.8} />
          </span>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-green-900 mb-1">
              <T>Find government schemes you qualify for</T>
            </h2>
            <p className="text-[15px] sm:text-base text-stone-600">
              <T>
                PM-KISAN, crop insurance, credit and subsidies — explained simply, filtered by your
                state and crop.
              </T>
            </p>
          </div>
          <Link
            href="/schemes"
            className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl px-6 min-h-[48px] transition-colors w-full sm:w-auto"
          >
            <T>Browse schemes</T>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Language reassurance ──────────────────────────────────────────── */
function LanguageStrip() {
  return (
    <section className="bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
        <Languages className="w-6 h-6 text-green-200" />
        <p className="text-lg font-medium">
          <T>Read everything in Hindi, Tamil, Telugu, Kannada and more.</T>
        </p>
      </div>
    </section>
  );
}
