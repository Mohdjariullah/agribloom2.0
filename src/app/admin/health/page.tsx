"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";

type Check = { name: string; status: "ok" | "missing" | "error"; detail?: string; ms?: number };
type Health = { summary: { ok: number; missing: number; error: number }; checks: Check[] };

export default function HealthPage() {
  const [data, setData] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/healthcheck", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run();
  }, []);

  return (
    <main className="min-h-screen bg-[#fafaf7] py-10 sm:py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">Admin · System</p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
              Integrations health
            </h1>
            <p className="text-stone-600 text-sm mt-1">
              Live ping of every external service the app depends on.
            </p>
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Checking…" : "Re-run"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {data && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-3">
            <div className="flex flex-wrap gap-3 text-sm pb-3 border-b border-stone-100">
              <Pill tone="ok">{data.summary.ok} ok</Pill>
              {data.summary.missing > 0 && <Pill tone="warn">{data.summary.missing} missing</Pill>}
              {data.summary.error > 0 && <Pill tone="err">{data.summary.error} error</Pill>}
            </div>
            {data.checks.map((c) => (
              <Row key={c.name} check={c} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Row({ check }: { check: Check }) {
  const Icon =
    check.status === "ok" ? CheckCircle2 : check.status === "error" ? XCircle : AlertTriangle;
  const color =
    check.status === "ok"
      ? "text-green-600"
      : check.status === "error"
        ? "text-red-600"
        : "text-amber-600";
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-medium text-stone-900 text-sm">{check.name}</span>
          {typeof check.ms === "number" && (
            <span className="text-xs text-stone-400 font-mono">{check.ms}ms</span>
          )}
        </div>
        {check.detail && (
          <p className="text-xs text-stone-600 mt-0.5 break-words">{check.detail}</p>
        )}
      </div>
    </div>
  );
}

function Pill({ tone, children }: { tone: "ok" | "warn" | "err"; children: React.ReactNode }) {
  const tones = {
    ok: "bg-green-50 text-green-800 border-green-200",
    warn: "bg-amber-50 text-amber-800 border-amber-200",
    err: "bg-red-50 text-red-800 border-red-200",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border ${tones[tone]}`}>
      {children}
    </span>
  );
}
