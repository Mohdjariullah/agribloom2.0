"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Sprout,
  ShoppingCart,
  Cloud,
  Bug,
  FlaskConical,
  FileText,
  ClipboardList,
  TrendingUp,
  ArrowUpRight,
  MessageCircle,
} from "lucide-react";
import { T } from "@/components/T";

type TrendPoint = {
  crop: string;
  percentage: number;
  totalArea: number;
  averageArea: number;
  totalEntries: number;
  district?: string;
};

type Profile = {
  username?: string;
  state?: string;
  district?: string;
  primaryCrops?: string[];
};

const QUICK_LINKS = [
  { href: "/agrilens", title: "Crops", desc: "Browse the crop database", icon: Sprout },
  { href: "/mandi-prices", title: "Mandi prices", desc: "Today's market rates", icon: ShoppingCart },
  { href: "/weather", title: "Weather", desc: "Forecast + crop alerts", icon: Cloud },
  { href: "/insect", title: "Pests", desc: "Identify and treat", icon: Bug },
  { href: "/fertilizer", title: "Fertilizer", desc: "NPK schedules", icon: FlaskConical },
  { href: "/schemes", title: "Govt schemes", desc: "Subsidies & insurance", icon: FileText },
  { href: "/chat", title: "Assistant", desc: "Ask anything farming", icon: MessageCircle },
  { href: "/farmer/crop-entry", title: "Log a crop", desc: "Record what you sowed", icon: ClipboardList },
];

const TooltipBox = (props: {
  active?: boolean;
  label?: string;
  payload?: Array<{ payload: TrendPoint }>;
}) => {
  const { active, label, payload } = props;
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-white border border-stone-200 rounded-lg shadow-md px-3 py-2 text-xs space-y-0.5">
      <p className="font-semibold text-stone-900">{label}</p>
      <p className="text-stone-600">{p.percentage.toFixed(1)}% of farms</p>
      <p className="text-stone-500">
        {p.totalArea.toFixed(1)} acres · {p.totalEntries} entr{p.totalEntries === 1 ? "y" : "ies"}
      </p>
    </div>
  );
};

export default function FarmerDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/users/profile", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/farmer/trends").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([p, t]) => {
        if (cancelled) return;
        setProfile(p?.data ?? null);
        setTrends(Array.isArray(t) ? t : []);
      })
      .catch((err) => console.error("dashboard load failed:", err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const topCrop = trends[0]?.crop;
  const districtLabel = trends[0]?.district || profile?.district;

  return (
    <main className="min-h-screen bg-[#fafaf7] py-10 sm:py-14 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hello strip */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">
            <T>Dashboard</T>
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 mb-1">
            <T>Welcome back</T>{profile?.username ? `, ${profile.username}` : ""}.
          </h1>
          <p className="text-stone-600 text-sm sm:text-base">
            {profile?.state || profile?.district ? (
              <T>{`Showing data for ${[profile.district, profile.state].filter(Boolean).join(", ")}.`}</T>
            ) : (
              <T>Set your state and district in your profile to personalize this view.</T>
            )}
          </p>
        </div>

        {/* Snapshot row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <SnapshotCard
            label="Your crops"
            value={
              profile?.primaryCrops?.length
                ? profile.primaryCrops.slice(0, 3).join(", ")
                : "Not set"
            }
            href="/profile"
            cta="Update"
          />
          <SnapshotCard
            label="Mandi prices"
            value="Live AGMARKNET feed"
            href="/mandi-prices"
            cta="Check"
          />
          <SnapshotCard
            label="Weather"
            value="5-day forecast"
            href="/weather"
            cta="View"
          />
        </div>

        {/* Trend chart */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5 sm:p-6 mb-8">
          <div className="flex items-baseline justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm uppercase tracking-[0.15em] text-stone-500 mb-1">
                Crop trends {districtLabel ? `· ${districtLabel}` : ""}
              </h2>
              <p className="text-stone-900 font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                {topCrop ? `${topCrop} leads` : "What farmers around you are sowing"}
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-stone-500 py-12 text-center">Loading…</p>
          ) : trends.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-stone-500 text-sm mb-3">
                No crop entries yet for your area.
              </p>
              <Link
                href="/farmer/crop-entry"
                className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
              >
                Log your first crop
              </Link>
            </div>
          ) : (
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="crop" stroke="#78716c" fontSize={11} tickMargin={6} />
                  <YAxis unit="%" domain={[0, 100]} stroke="#78716c" fontSize={11} />
                  <Tooltip content={<TooltipBox />} cursor={{ fill: "#f5f5f4" }} />
                  <Bar dataKey="percentage" fill="#16a34a" radius={[6, 6, 0, 0]} animationDuration={600} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {topCrop && trends.length > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-900">
              <strong>Heads up:</strong> {topCrop} is the most-sown crop here.
              Consider rotation to avoid a price drop at harvest.
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="mb-4">
          <h2 className="text-sm uppercase tracking-[0.15em] text-stone-500 mb-3">
            <T>Quick access</T>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {QUICK_LINKS.map((q) => {
              const Icon = q.icon;
              return (
                <Link
                  key={q.href}
                  href={q.href}
                  className="group bg-white border border-stone-200 hover:border-stone-300 hover:shadow-sm rounded-xl p-4 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-stone-100 group-hover:bg-green-50 group-hover:text-green-700 text-stone-700 p-2 rounded-lg transition-colors">
                      <Icon className="w-4 h-4" />
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-sm font-semibold text-stone-900 mb-0.5"><T>{q.title}</T></p>
                  <p className="text-xs text-stone-500 leading-snug"><T>{q.desc}</T></p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

function SnapshotCard({
  label,
  value,
  href,
  cta,
}: {
  label: string;
  value: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white border border-stone-200 hover:border-stone-300 hover:shadow-sm rounded-xl p-4 transition-all flex items-start justify-between gap-3"
    >
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-stone-500 mb-1"><T>{label}</T></p>
        <p className="text-stone-900 font-medium truncate"><T>{value}</T></p>
      </div>
      <span className="text-xs text-stone-500 group-hover:text-stone-900 flex items-center gap-0.5 flex-shrink-0 mt-0.5">
        <T>{cta}</T> <ArrowUpRight className="w-3 h-3" />
      </span>
    </Link>
  );
}
