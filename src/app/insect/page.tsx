"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bug, AlertCircle, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader, PageShell } from "@/components/PageHeader";

type Pest = {
  _id: string;
  slug: string;
  name: string;
  type: string;
  affectedCrops: string[];
  symptoms: string;
  effect?: string;
  prevention: string[];
  severity?: "low" | "medium" | "high" | "critical";
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function PestPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [pests, setPests] = useState<Pest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (debounced) {
      // If the term looks like a crop name (single word), use crop filter,
      // otherwise full-text search across symptoms.
      params.set("q", debounced);
      params.set("crop", debounced);
    }
    params.set("limit", "60");

    // Try crop filter first; if no results, fall back to text search.
    axios
      .get(`/api/pests?${params.toString()}`)
      .then(async (res) => {
        if (cancelled) return;
        let items: Pest[] = res.data.items ?? [];
        if (items.length === 0 && debounced) {
          // Fallback: drop crop filter, keep text search
          const r2 = await axios.get(`/api/pests?q=${encodeURIComponent(debounced)}&limit=60`);
          items = r2.data.items ?? [];
        }
        setPests(items);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          axios.isAxiosError(err) ? err.response?.data?.error ?? err.message : "Failed to load pests"
        );
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const headline = useMemo(() => {
    if (loading) return "Loading…";
    if (error) return error;
    if (!debounced && pests.length === 0) return "Search a crop or pest to begin.";
    if (pests.length === 0) return "No pests match your search.";
    return `${pests.length} pest${pests.length === 1 ? "" : "s"}`;
  }, [loading, error, debounced, pests.length]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Pests & diseases"
        title="Identify and treat what's eating your crop."
        subtitle="Search by crop or pest name for symptoms, prevention steps, and control measures."
      />

      <div className="max-w-2xl mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <Input
          type="text"
          placeholder="Search crop (Tomato, Rice…) or pest (Aphid, Blight…)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 py-5 bg-white border-stone-300 focus-visible:ring-stone-900 focus-visible:border-stone-900 rounded-lg"
        />
      </div>

      <p className="text-stone-500 text-sm mb-5">{headline}</p>

      <AnimatePresence>
        {!loading && !error && pests.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {pests.map((pest) => (
              <Link
                key={pest._id}
                href={`/pests/${pest.slug}`}
                className="group block bg-white rounded-2xl border border-stone-200 hover:border-stone-300 p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-semibold text-stone-900 group-hover:text-stone-700">
                    {pest.name}
                  </h3>
                  {pest.severity && (
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                        SEVERITY_COLORS[pest.severity] ?? "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {pest.severity}
                    </span>
                  )}
                </div>
                {pest.affectedCrops?.length > 0 && (
                  <p className="text-xs text-stone-500 mb-2 truncate">
                    Affects: {pest.affectedCrops.slice(0, 3).join(", ")}
                    {pest.affectedCrops.length > 3 && (
                      <span className="text-stone-400">
                        {" "}
                        +{pest.affectedCrops.length - 3} more
                      </span>
                    )}
                  </p>
                )}
                <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed">
                  {pest.symptoms || pest.effect || "Click for details"}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-3 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {pest.prevention.length} control measure{pest.prevention.length === 1 ? "" : "s"}
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && !error && !debounced && pests.length === 0 && (
        <div className="text-center py-12">
          <Bug className="h-10 w-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 max-w-md mx-auto text-sm">
            Try searching for a crop you grow — like &ldquo;Rice&rdquo; or &ldquo;Tomato&rdquo; — to
            see common pests and proven control methods.
          </p>
        </div>
      )}

      {error && (
        <div className="py-6 bg-red-50 border border-red-200 rounded-xl max-w-md text-center">
          <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </PageShell>
  );
}
