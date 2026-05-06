"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  MailCheck,
  Sprout,
  Bug,
  FileText,
  ShoppingCart,
  ClipboardList,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { T } from "@/components/T";

type Stats = {
  users: {
    total: number;
    farmers: number;
    admins: number;
    verified: number;
    verifiedPct: number;
    profileCompleted: number;
    completionPct: number;
    farmersWithState: number;
  };
  content: {
    crops: number;
    pests: number;
    schemes: number;
    mandiPriceRecords: number;
    cropEntries: number;
  };
  recentFarmers: {
    id: string;
    username: string;
    email: string;
    state?: string;
    district?: string;
    createdAt: string;
    profileCompleted: boolean;
  }[];
  topStates: { state: string; count: number }[];
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#fafaf7] py-10 sm:py-14 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">
              <T>Admin · Dashboard</T>
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900">
              <T>Overview</T>
            </h1>
            <p className="text-stone-600 text-sm mt-1">
              <T>How AgriBloom is being used right now.</T>
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <T>Refresh</T>
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {loading && !data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-xl h-28 animate-pulse" />
            ))}
          </div>
        )}

        {data && (
          <>
            {/* Top KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Stat
                icon={<Users className="w-4 h-4" />}
                label="Total users"
                value={data.users.total}
                hint={`${data.users.farmers} farmers · ${data.users.admins} admin`}
              />
              <Stat
                icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
                label="Profiles completed"
                value={data.users.profileCompleted}
                hint={`${data.users.completionPct}% of farmers`}
                progress={data.users.completionPct}
              />
              <Stat
                icon={<MailCheck className="w-4 h-4 text-blue-600" />}
                label="Email verified"
                value={data.users.verified}
                hint={`${data.users.verifiedPct}% of users`}
                progress={data.users.verifiedPct}
              />
              <Stat
                icon={<ClipboardList className="w-4 h-4 text-amber-600" />}
                label="Crop entries logged"
                value={data.content.cropEntries}
                hint={`from ${data.users.farmersWithState} farmers w/ state set`}
              />
            </div>

            {/* Content stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <Mini icon={<Sprout className="w-4 h-4" />} label="Crops" value={data.content.crops} href="/agrilens" />
              <Mini icon={<Bug className="w-4 h-4" />} label="Pests" value={data.content.pests} href="/insect" />
              <Mini icon={<FileText className="w-4 h-4" />} label="Schemes" value={data.content.schemes} href="/schemes" />
              <Mini icon={<ShoppingCart className="w-4 h-4" />} label="Mandi cache" value={data.content.mandiPriceRecords} href="/mandi-prices" />
            </div>

            {/* Recent farmers + Top states */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl shadow-sm p-5 sm:p-6">
                <h2 className="text-xs uppercase tracking-[0.15em] text-stone-500 mb-4">
                  <T>Recent farmer signups</T>
                </h2>
                {data.recentFarmers.length === 0 ? (
                  <p className="text-stone-500 text-sm py-6 text-center">
                    No farmer signups yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-stone-100">
                    {data.recentFarmers.map((f) => (
                      <li key={f.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-stone-900 text-sm truncate">
                            {f.username}
                          </p>
                          <p className="text-xs text-stone-500 truncate">
                            {f.email}
                            {f.state && ` · ${[f.district, f.state].filter(Boolean).join(", ")}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {f.profileCompleted ? (
                            <span className="text-[10px] uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                              Set up
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              Onboarding
                            </span>
                          )}
                          <span className="text-xs text-stone-400 whitespace-nowrap">
                            {timeAgo(f.createdAt)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5 sm:p-6">
                <h2 className="text-xs uppercase tracking-[0.15em] text-stone-500 mb-4">
                  <T>Top states</T>
                </h2>
                {data.topStates.length === 0 ? (
                  <p className="text-stone-500 text-sm py-6 text-center">
                    No data yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {data.topStates.map((s) => {
                      const max = data.topStates[0].count || 1;
                      const pct = Math.round((s.count / max) * 100);
                      return (
                        <li key={s.state}>
                          <div className="flex items-baseline justify-between mb-1">
                            <span className="text-sm font-medium text-stone-900">{s.state}</span>
                            <span className="text-xs text-stone-500">{s.count}</span>
                          </div>
                          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-stone-700 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Quick admin actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ActionCard
                icon={<ClipboardList className="w-4 h-4" />}
                title="Crop entries"
                desc="View and manage every farmer's logged crops"
                href="/admin/analysis"
              />
              <ActionCard
                icon={<ShieldCheck className="w-4 h-4" />}
                title="System health"
                desc="Live ping of every external integration"
                href="/admin/health"
              />
              <ActionCard
                icon={<Users className="w-4 h-4" />}
                title="Browse content"
                desc="Open the public site as a farmer would"
                href="/agrilens"
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function timeAgo(iso: string) {
  const sec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function Stat({
  icon,
  label,
  value,
  hint,
  progress,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
  progress?: number;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 mb-2">
        {icon}
        <T>{label}</T>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-stone-900 mb-1">{value}</p>
      {typeof progress === "number" && (
        <div className="h-1 bg-stone-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-stone-900 rounded-full transition-all"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
      {hint && <p className="text-xs text-stone-500 truncate">{hint}</p>}
    </div>
  );
}

function Mini({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white border border-stone-200 hover:border-stone-300 hover:shadow-sm rounded-xl p-4 transition-all"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-stone-600">{icon}</span>
        <ArrowUpRight className="w-3 h-3 text-stone-300 group-hover:text-stone-900 transition-colors" />
      </div>
      <p className="text-xl font-bold text-stone-900">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-stone-500"><T>{label}</T></p>
    </Link>
  );
}

function ActionCard({
  icon,
  title,
  desc,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white border border-stone-200 hover:border-stone-300 hover:shadow-sm rounded-xl p-5 transition-all flex items-start gap-3"
    >
      <span className="bg-stone-100 group-hover:bg-stone-900 group-hover:text-white text-stone-700 p-2 rounded-lg transition-colors flex-shrink-0">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-stone-900 mb-0.5 flex items-center gap-1.5">
          <T>{title}</T>
          <ArrowUpRight className="w-3 h-3 text-stone-400 group-hover:text-stone-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
        </p>
        <p className="text-xs text-stone-500 leading-snug"><T>{desc}</T></p>
      </div>
    </Link>
  );
}
