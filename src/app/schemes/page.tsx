"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { INDIAN_STATES } from "@/lib/indianStates";

type Scheme = {
  _id: string;
  slug: string;
  name: string;
  shortName?: string;
  type: string;
  description: string;
  benefits: string;
  ministry?: string;
  targetFarmers: string[];
  applicableStates: string[];
};

const TYPES = [
  { value: "", label: "All types" },
  { value: "subsidy", label: "Subsidy" },
  { value: "insurance", label: "Insurance" },
  { value: "credit", label: "Credit" },
  { value: "input_support", label: "Input support" },
  { value: "marketing", label: "Marketing" },
  { value: "training", label: "Training" },
  { value: "pension", label: "Pension" },
];

const TARGETS = [
  { value: "", label: "All farmers" },
  { value: "small", label: "Small farmers" },
  { value: "marginal", label: "Marginal farmers" },
  { value: "women", label: "Women-led" },
  { value: "sc_st", label: "SC/ST" },
];

export default function SchemesPage() {
  const [items, setItems] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [type, setType] = useState("");
  const [state, setState] = useState("");
  const [target, setTarget] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (debounced) params.set("q", debounced);
    if (type) params.set("type", type);
    if (state) params.set("state", state);
    if (target) params.set("target", target);
    params.set("limit", "60");

    axios
      .get(`/api/schemes?${params.toString()}`)
      .then((r) => !cancelled && setItems(r.data.items ?? []))
      .catch((err) => {
        if (cancelled) return;
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error ?? err.message
            : "Failed to load"
        );
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [debounced, type, state, target]);

  const headline = useMemo(() => {
    if (loading) return "Loading…";
    if (error) return error;
    if (!items.length) return "No schemes match your filters.";
    return `${items.length} scheme${items.length === 1 ? "" : "s"}`;
  }, [loading, error, items.length]);

  return (
    <main className="min-h-screen bg-[#fafaf7] py-10 sm:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 sm:mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">
            Government schemes
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-stone-900 mb-3">
            Subsidies, insurance and credit, in one place.
          </h1>
          <p className="text-stone-600 text-base sm:text-lg max-w-2xl">
            30+ central and state schemes for Indian farmers. Filter by type, state, or eligibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px_180px] gap-3 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              type="text"
              placeholder="Search schemes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 py-5 bg-white border-stone-300 focus-visible:ring-stone-900 focus-visible:border-stone-900 rounded-lg"
            />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="bg-white border border-stone-300 rounded-lg px-3 py-2.5 text-sm">
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={state} onChange={(e) => setState(e.target.value)} className="bg-white border border-stone-300 rounded-lg px-3 py-2.5 text-sm">
            <option value="">All states</option>
            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="bg-white border border-stone-300 rounded-lg px-3 py-2.5 text-sm">
            {TARGETS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <p className="text-stone-500 text-sm mb-5">{headline}</p>

        <AnimatePresence>
          {!loading && !error && items.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {items.map((s) => (
                <Link
                  key={s._id}
                  href={`/schemes/${s.slug}`}
                  className="group block bg-white border border-stone-200 hover:border-stone-300 hover:shadow-sm rounded-xl p-5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      {s.shortName && (
                        <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded mb-2">
                          {s.shortName}
                        </span>
                      )}
                      <h3 className="text-base font-semibold text-stone-900 leading-snug group-hover:text-stone-700">
                        {s.name}
                      </h3>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-stone-400 group-hover:text-stone-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                  <p className="text-sm text-stone-600 line-clamp-2 mb-3">{s.description}</p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <Tag>{s.type.replace("_", " ")}</Tag>
                    {s.applicableStates.length === 0 ? (
                      <Tag tone="green">All India</Tag>
                    ) : (
                      <Tag tone="blue">{s.applicableStates.length} states</Tag>
                    )}
                    {s.targetFarmers.includes("women") && <Tag tone="pink">Women</Tag>}
                    {s.targetFarmers.includes("small") && <Tag>Small</Tag>}
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone?: "blue" | "green" | "pink" }) {
  const tones: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    pink: "bg-pink-50 text-pink-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider ${tone ? tones[tone] : "bg-stone-100 text-stone-700"}`}>
      {children}
    </span>
  );
}
