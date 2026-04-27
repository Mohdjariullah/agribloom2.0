"use client";

import { useEffect, useState } from "react";
import { PageHeader, PageShell } from "@/components/PageHeader";

interface Trend {
  crop: string;
  totalEntries: number;
  totalArea: number;
  averageArea: number;
  percentage: number;
  district: string;
  village?: string;
}

export default function TrendsPage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/farmer/trends")
      .then((r) => r.json())
      .then((d) => setTrends(Array.isArray(d) ? d : []))
      .catch(() => setTrends([]))
      .finally(() => setLoading(false));
  }, []);

  const districtLabel = trends[0]?.district;

  return (
    <PageShell>
      <PageHeader
        eyebrow="My farm · Trends"
        title={districtLabel ? `What's being sown in ${districtLabel}` : "Crop sowing trends"}
        subtitle="Aggregated from every farmer who's logged a crop in your district. Use this to spot oversaturated crops and plan rotation."
      />

      {loading ? (
        <p className="text-stone-500 text-sm">Loading trends…</p>
      ) : trends.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center max-w-xl">
          <p className="text-stone-700 font-medium mb-1">Not enough data yet</p>
          <p className="text-sm text-stone-500">
            No farmers in your area have logged crops yet. You can be the first — go to{" "}
            <a href="/farmer/crop-entry" className="text-stone-900 underline">
              Log a crop
            </a>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trends.map((t, i) => (
            <div
              key={i}
              className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-base font-semibold text-stone-900 capitalize">{t.crop}</h3>
                <span className="text-stone-900 font-semibold text-sm">
                  {t.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-stone-700"
                  style={{ width: `${Math.min(100, t.percentage)}%` }}
                />
              </div>
              <ul className="space-y-1.5 text-sm text-stone-600">
                <Row label="Entries" value={t.totalEntries.toString()} />
                <Row label="Total area" value={`${t.totalArea.toFixed(1)} acres`} />
                <Row label="Avg per farm" value={`${t.averageArea.toFixed(1)} acres`} />
              </ul>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-stone-500">{label}</span>
      <span className="text-stone-900 font-medium">{value}</span>
    </li>
  );
}
