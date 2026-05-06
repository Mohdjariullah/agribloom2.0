"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, Sun, CloudRain, Cloud } from "lucide-react";
import { T } from "@/components/T";

/**
 * Hero-side preview card. Tabbed between Mandi prices and Weather.
 * Uses realistic sample data with an explicit "Sample" badge so it's
 * obviously a preview, not deceptive.
 *
 * The rounded chrome + subtle glow + dot pattern make it feel like a
 * product screenshot rather than a static panel — the hero finally has
 * a focal point on the right.
 */
type Tab = "prices" | "weather";

const PRICE_ROWS = [
  { market: "Hassan", value: "₹2,520", trend: "up" as const, delta: "+4.6%" },
  { market: "Bengaluru", value: "₹2,400", trend: "up" as const, delta: "+1.2%" },
  { market: "Tumkur", value: "₹2,300", trend: "flat" as const, delta: "—" },
  { market: "Mysore", value: "₹2,180", trend: "down" as const, delta: "−2.1%" },
];

const FORECAST = [
  { day: "Mon", icon: Sun, temp: 28 },
  { day: "Tue", icon: Sun, temp: 29 },
  { day: "Wed", icon: Cloud, temp: 27 },
  { day: "Thu", icon: CloudRain, temp: 24 },
  { day: "Fri", icon: CloudRain, temp: 23 },
];

export function HeroPreview() {
  const [tab, setTab] = useState<Tab>("prices");

  return (
    <div className="relative">
      {/* Soft glow behind the card */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-green-100 via-green-50 to-amber-100 opacity-60 blur-2xl"
      />

      <div className="relative bg-white border border-stone-200 rounded-2xl shadow-xl shadow-green-900/5 overflow-hidden">
        {/* Card header — tabs */}
        <div className="px-5 sm:px-6 pt-4 pb-0 flex items-center justify-between gap-3 border-b border-stone-100">
          <div className="flex gap-1">
            <button
              onClick={() => setTab("prices")}
              className={`px-3 py-2 text-sm font-semibold transition-colors relative ${
                tab === "prices" ? "text-stone-900" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <T>Prices today</T>
              {tab === "prices" && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 bg-green-700" />
              )}
            </button>
            <button
              onClick={() => setTab("weather")}
              className={`px-3 py-2 text-sm font-semibold transition-colors relative ${
                tab === "weather" ? "text-stone-900" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <T>Weather</T>
              {tab === "weather" && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 bg-green-700" />
              )}
            </button>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
            <T>Sample</T>
          </span>
        </div>

        {tab === "prices" ? <PricesPanel /> : <WeatherPanel />}
      </div>
    </div>
  );
}

function PricesPanel() {
  return (
    <>
      {/* Subhead */}
      <div className="px-5 sm:px-6 pt-5 pb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-1">
            <T>Tomato · Karnataka</T>
          </p>
          <p className="text-2xl font-semibold text-stone-900 tabular-nums">
            ₹2,350 <span className="text-base font-medium text-stone-500">/quintal</span>
          </p>
        </div>
        <span className="text-xs text-green-700 font-semibold inline-flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          <span className="tabular-nums">+1.8%</span>
        </span>
      </div>

      {/* Rows */}
      <ul className="px-5 sm:px-6 pb-2 space-y-1">
        {PRICE_ROWS.map((r) => (
          <li
            key={r.market}
            className="flex items-center justify-between py-2 border-b border-stone-100 last:border-b-0 text-sm"
          >
            <span className="text-stone-800 font-medium">{r.market}</span>
            <span className="flex items-center gap-3">
              <span className="text-stone-700 tabular-nums">{r.value}</span>
              <span className="inline-flex items-center gap-1 w-14 justify-end tabular-nums text-xs">
                {r.trend === "up" && (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-700">{r.delta}</span>
                  </>
                )}
                {r.trend === "down" && (
                  <>
                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-red-600">{r.delta}</span>
                  </>
                )}
                {r.trend === "flat" && (
                  <>
                    <span className="w-3.5 h-px bg-stone-300" />
                    <span className="text-stone-400">{r.delta}</span>
                  </>
                )}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {/* Footer CTA */}
      <div className="px-5 sm:px-6 py-4 bg-stone-50/80 border-t border-stone-100">
        <Link
          href="/mandi-prices"
          className="text-sm font-semibold text-green-800 hover:text-green-900 inline-flex items-center gap-1 group"
        >
          <T>Open today&apos;s prices</T>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </>
  );
}

function WeatherPanel() {
  return (
    <>
      {/* Today */}
      <div className="px-5 sm:px-6 pt-5 pb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-1">
            <T>Bengaluru · Today</T>
          </p>
          <p className="text-4xl font-semibold text-stone-900 tabular-nums leading-none">
            28°
          </p>
          <p className="text-sm text-stone-500 mt-1">
            <T>Sunny · Light breeze</T>
          </p>
        </div>
        <Sun className="w-14 h-14 text-amber-500" strokeWidth={1.4} />
      </div>

      {/* Forecast row */}
      <div className="px-5 sm:px-6 pb-4 grid grid-cols-5 gap-1.5">
        {FORECAST.map((d) => {
          const Icon = d.icon;
          return (
            <div
              key={d.day}
              className="flex flex-col items-center gap-1.5 border border-stone-200 rounded-lg py-2"
            >
              <span className="text-[10px] uppercase tracking-wider text-stone-500">{d.day}</span>
              <Icon
                className={`w-4 h-4 ${
                  d.icon === Sun
                    ? "text-amber-500"
                    : d.icon === CloudRain
                      ? "text-blue-500"
                      : "text-stone-400"
                }`}
                strokeWidth={1.6}
              />
              <span className="text-stone-800 font-medium tabular-nums text-sm">{d.temp}°</span>
            </div>
          );
        })}
      </div>

      {/* Crop alert */}
      <div className="mx-5 sm:mx-6 mb-5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
        <p className="text-xs text-amber-900 inline-flex items-start gap-1.5 leading-snug">
          <CloudRain className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            <T>Heavy rain Thu–Fri. Hold tomato harvest.</T>
          </span>
        </p>
      </div>

      {/* Footer CTA */}
      <div className="px-5 sm:px-6 py-4 bg-stone-50/80 border-t border-stone-100">
        <Link
          href="/weather"
          className="text-sm font-semibold text-green-800 hover:text-green-900 inline-flex items-center gap-1 group"
        >
          <T>Open weather</T>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </>
  );
}
