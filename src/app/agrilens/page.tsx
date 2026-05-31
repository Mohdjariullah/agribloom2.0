"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { CropVisual } from "@/components/CropVisual";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, PageShell } from "@/components/PageHeader";

type Crop = {
  _id: string;
  slug: string;
  name: string;
  scientificName?: string;
  category: string;
  season: string[];
  soilTypes: string[];
  waterRequirement?: "low" | "medium" | "high";
  waterRequirementText?: string;
  sowingMonth?: string;
  floweringPeriod?: string;
  harvestingMonth?: string;
  sunlightRequirement?: string;
  imageUrl?: string;
};

const SEASONS = [
  { value: "", label: "All seasons" },
  { value: "kharif", label: "Kharif (monsoon)" },
  { value: "rabi", label: "Rabi (winter)" },
  { value: "zaid", label: "Zaid (summer)" },
];

const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "cereal", label: "Cereal" },
  { value: "pulse", label: "Pulse" },
  { value: "vegetable", label: "Vegetable" },
  { value: "fruit", label: "Fruit" },
  { value: "oilseed", label: "Oilseed" },
  { value: "spice", label: "Spice" },
  { value: "cash_crop", label: "Cash crop" },
];

export default function AgriLensPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [season, setSeason] = useState("");
  const [category, setCategory] = useState("");
  const [debounced, setDebounced] = useState("");

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (debounced) params.set("q", debounced);
    if (season) params.set("season", season);
    if (category) params.set("category", category);
    params.set("limit", "60");

    setLoading(true);
    setError(null);
    axios
      .get(`/api/crops?${params.toString()}`)
      .then((res) => {
        if (cancelled) return;
        setCrops(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error ?? err.message
            : "Failed to load crops"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced, season, category]);

  const headline = useMemo(() => {
    if (loading) return "Loading…";
    if (error) return error;
    if (!crops.length) return "No crops match your filters.";
    return `${total} crop${total === 1 ? "" : "s"}`;
  }, [loading, error, crops.length, total]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Crops"
        title="Browse 200+ crops with filters."
        subtitle="Season, soil, water needs, sowing months — all in one place."
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px] gap-3 mb-8">
        <div className="relative">
          <Label htmlFor="crop-search" className="sr-only">Search crop</Label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            id="crop-search"
            type="text"
            placeholder="Search crop (e.g., Tomato, Rice)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 py-5 bg-white border-stone-300 focus-visible:ring-stone-900 focus-visible:border-stone-900 rounded-lg"
          />
        </div>

        <select
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          className="bg-white border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
        >
          {SEASONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <p className="text-stone-500 text-sm mb-5">{headline}</p>

      <AnimatePresence>
        {!loading && !error && crops.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {crops.map((crop) => (
              <Link
                key={crop._id}
                href={`/crops/${crop.slug}`}
                className="group bg-white rounded-2xl border border-stone-200 hover:border-stone-300 hover:shadow-md overflow-hidden transition-all"
              >
                <CropVisual
                  name={crop.name}
                  category={crop.category}
                  className="h-32 w-full group-hover:brightness-[1.03] transition-all"
                />
                <div className="p-4">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="text-base font-semibold text-stone-900 truncate">
                      {crop.name}
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {crop.category.replace("_", " ")}
                    </span>
                  </div>
                  {crop.scientificName && (
                    <p className="text-xs text-stone-500 italic mb-3 truncate">
                      {crop.scientificName}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {crop.season.map((s) => (
                      <span key={s} className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full capitalize">
                        {s}
                      </span>
                    ))}
                    {crop.waterRequirement && (
                      <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full capitalize">
                        {crop.waterRequirement} water
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
