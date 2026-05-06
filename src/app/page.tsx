import Link from "next/link";
import {
  ArrowRight,
  ShoppingCart,
  Cloud,
  FileText,
} from "lucide-react";
import Footer from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { T } from "@/components/T";
import { TopUtilityStrip } from "@/components/landing/TopUtilityStrip";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { MobileCTABar } from "@/components/landing/MobileCTABar";
import { HeroPreview } from "@/components/landing/HeroPreview";

export default function Home() {
  return (
    <>
      <TopUtilityStrip />
      <main className="bg-[#F7FAF5] text-stone-800 pb-24 sm:pb-0">
        <Hero />
        <TrustStrip />
        <Actions />
        <Principles />
        <Closing />
        <Footer />
        <ChatWidget />
      </main>
      <MobileCTABar />
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────
 * HERO — split layout. Copy + CTAs on the left, real product preview
 * card on the right. The card IS the hero illustration.
 * ──────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-16 sm:pb-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left — copy */}
          <div className="lg:col-span-7">
            <p className="text-xs sm:text-sm uppercase tracking-[0.28em] text-green-800 font-semibold mb-6">
              AgriBloom
            </p>

            <h1 className="text-[40px] sm:text-[56px] lg:text-[68px] font-semibold tracking-tight text-stone-900 leading-[1.05] mb-6">
              <T>Practical farming tools,</T>
              <br />
              <span className="text-green-700">
                <T>in one place.</T>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-stone-700 leading-relaxed max-w-xl mb-8">
              <T>
                Crop guides, mandi rates, weather, pest control and government
                schemes — drawn from official data. Built for Indian farmers.
              </T>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-8">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-green-700 hover:bg-green-800 text-white font-semibold text-[15px] px-7 py-4 rounded-full transition-colors shadow-sm"
              >
                <T>Create free account</T>
              </Link>
              <Link
                href="/mandi-prices"
                className="inline-flex items-center justify-center gap-1 text-stone-800 hover:text-stone-900 font-semibold text-[15px] px-3 py-4 transition-colors group"
              >
                <T>Browse mandi prices</T>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <p className="text-sm text-stone-500">
              <span lang="hi" className="text-stone-700">हिंदी</span>
              <span className="mx-1.5 text-stone-300">·</span>
              <span lang="ta" className="text-stone-700">தமிழ்</span>
              <span className="mx-1.5 text-stone-300">·</span>
              <span lang="kn" className="text-stone-700">ಕನ್ನಡ</span>
              <span className="mx-1.5 text-stone-300">·</span>
              <T>and 7 more</T>
            </p>
          </div>

          {/* Right — product preview */}
          <div className="lg:col-span-5 lg:pl-4">
            <HeroPreview />
          </div>
        </div>
      </div>

      {/* Soft horizon line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-green-200 to-transparent"
      />
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────
 * ACTIONS — three big verb-led blocks. Each one a real entry point.
 * ──────────────────────────────────────────────────────────────────── */
function Actions() {
  const blocks = [
    {
      eyebrow: "What's it worth?",
      title: "Check today's mandi rate",
      desc: "Wholesale prices from 3,000+ markets, with a 7-day trend so you can pick the right day to sell.",
      href: "/mandi-prices",
      cta: "Browse prices",
      icon: ShoppingCart,
    },
    {
      eyebrow: "What's the weather?",
      title: "5-day forecast for your district",
      desc: "Tied to crops you've sown — heavy rain warnings, frost risk, ideal sowing windows.",
      href: "/weather",
      cta: "Open weather",
      icon: Cloud,
    },
    {
      eyebrow: "What can I claim?",
      title: "Find your government scheme",
      desc: "30+ subsidies, insurance and credit programmes. Filter by state, eligibility and crop.",
      href: "/schemes",
      cta: "Browse schemes",
      icon: FileText,
    },
  ];
  return (
    <section className="bg-white border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-2xl mb-10 sm:mb-14">
          <p className="text-xs uppercase tracking-[0.22em] text-green-800 font-semibold mb-3">
            <T>Three things you&apos;ll do most</T>
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900">
            <T>Built around the questions you ask every day.</T>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blocks.map((b) => {
            const Icon = b.icon;
            return (
              <Link
                key={b.title}
                href={b.href}
                className="group flex flex-col p-7 bg-[#F7FAF5] hover:bg-green-50 border border-stone-200 hover:border-green-300 rounded-2xl transition-colors"
              >
                <Icon className="w-7 h-7 text-green-700 mb-7" strokeWidth={1.6} />
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-2 font-semibold">
                  <T>{b.eyebrow}</T>
                </p>
                <h3 className="text-xl font-semibold text-stone-900 mb-3 leading-snug">
                  <T>{b.title}</T>
                </h3>
                <p className="text-stone-600 text-[15px] leading-relaxed mb-6 flex-1">
                  <T>{b.desc}</T>
                </p>
                <span className="text-sm font-semibold text-green-800 inline-flex items-center gap-1">
                  <T>{b.cta}</T>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────
 * PRINCIPLES — three things this product believes in.
 * ──────────────────────────────────────────────────────────────────── */
function Principles() {
  const points = [
    {
      title: "Government & research data only",
      body:
        "Mandi prices come from data.gov.in (AGMARKNET). Weather from OpenWeatherMap. Crop, pest and fertilizer guidance is drawn from ICAR and Krishi Vigyan Kendra publications.",
    },
    {
      title: "Built for the way you actually work",
      body:
        "Mobile-first, low-bandwidth, in your language. Pick a state and crop, get straight to the answer. No clutter, no jargon, no carousels.",
    },
    {
      title: "Free, forever",
      body:
        "Sign up to save your district and crops for personalized prices and weather — or browse without an account. No email needed to read.",
    },
  ];
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12 sm:mb-16">
          <p className="text-xs uppercase tracking-[0.22em] text-green-800 font-semibold mb-3">
            <T>Why we exist</T>
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900">
            <T>Honest data. Plain language. Nothing made up.</T>
          </h2>
        </div>

        <dl className="space-y-10 sm:space-y-12 max-w-3xl">
          {points.map((p, i) => (
            <div key={p.title} className="grid grid-cols-[2rem_1fr] gap-4 sm:gap-6">
              <span className="text-3xl font-semibold text-green-700/70 tabular-nums leading-none pt-1">
                0{i + 1}
              </span>
              <div>
                <dt className="text-xl sm:text-2xl font-semibold text-stone-900 mb-2 leading-snug">
                  <T>{p.title}</T>
                </dt>
                <dd className="text-stone-600 text-[16px] sm:text-[17px] leading-relaxed">
                  <T>{p.body}</T>
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────
 * CLOSING — dark, confident.
 * ──────────────────────────────────────────────────────────────────── */
function Closing() {
  return (
    <section className="border-t border-stone-200 bg-stone-900 text-stone-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-green-400 font-semibold mb-4">
            <T>Get started</T>
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.05] mb-6">
            <T>Start with one decision:</T>
            <br />
            <span className="text-green-400">
              <T>what&apos;s your crop selling for today?</T>
            </span>
          </h2>
          <p className="text-stone-300 text-lg leading-relaxed mb-9 max-w-2xl">
            <T>
              Free to use. No email required to read prices and weather.
              Sign up only when you want personalized alerts.
            </T>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Link
              href="/mandi-prices"
              className="inline-flex items-center justify-center bg-white hover:bg-stone-100 text-stone-900 font-semibold px-7 py-4 rounded-full transition-colors"
            >
              <T>Open today&apos;s prices</T>
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-1 text-stone-200 hover:text-white font-semibold px-3 py-4 transition-colors group"
            >
              <T>Or create an account</T>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
