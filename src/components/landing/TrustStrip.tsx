import { ShieldCheck } from "lucide-react";
import { T } from "@/components/T";

const SOURCES = ["AGMARKNET", "data.gov.in", "ICAR & KVK", "IMD", "myScheme"];

/**
 * "Powered by public data" ribbon — the credible substitute for stock
 * photography. Borrowing the *names* of recognised public data sources is
 * exactly what reads as trustworthy to this audience, and it's legally clean.
 */
export function TrustStrip() {
  return (
    <section aria-label="Data sources" className="border-y border-blue-100 bg-blue-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-x-6 flex-wrap">
          <p className="flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.18em] text-blue-900 font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <T>Powered by public data</T>
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-blue-900">
            {SOURCES.map((s, i) => (
              <li key={s} className="flex items-center gap-x-5">
                <span className="font-semibold tracking-tight">{s}</span>
                {i < SOURCES.length - 1 && (
                  <span aria-hidden className="text-blue-300 hidden sm:inline">·</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
