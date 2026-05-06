import { T } from "@/components/T";

const SOURCES = [
  "data.gov.in",
  "ICAR & KVK",
  "OpenWeatherMap",
  "myscheme.gov.in",
  "IMD",
];

/**
 * Clean wordmark row — no emoji, no colored pill chrome.
 * The Indian govt portal cue comes from the seriousness of the layout,
 * not from decorative iconography.
 */
export function TrustStrip() {
  return (
    <section aria-label="Data sources" className="border-y border-stone-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-x-8 sm:gap-y-2 flex-wrap">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
            <T>Sourced from</T>
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-700">
            {SOURCES.map((s, i) => (
              <li key={s} className="flex items-center gap-x-6">
                <span className="font-medium tracking-tight">{s}</span>
                {i < SOURCES.length - 1 && (
                  <span aria-hidden className="text-stone-300 hidden sm:inline">·</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
