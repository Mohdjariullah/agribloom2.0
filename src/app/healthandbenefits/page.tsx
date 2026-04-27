"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import cropDataRaw from "@/data/healthandbenifits.json";
import { PageHeader, PageShell } from "@/components/PageHeader";

interface HealthBenefits {
  benefit1?: string;
  benefit2?: string;
  benefit3?: string;
}

interface Crop {
  id: number;
  commonName: string;
  scientificName: string;
  healthBenefits?: HealthBenefits;
  carbohydrates?: number;
  proteins?: number;
  fats?: number;
  vitamins?: string[];
  minerals?: string[];
  bestTimeToConsume?: string;
  shelfLife?: string;
}

const cropData: Crop[] = cropDataRaw as Crop[];

const TIME_SLOTS = [
  { period: "Morning", time: "6 – 9 AM", description: "Detoxifying, vitamin-rich fruits, light carbs" },
  { period: "Mid-Morning", time: "9 – 11 AM", description: "Fruits, nuts, energy-boosting foods" },
  { period: "Lunch", time: "12 – 2 PM", description: "Heavier foods, high in protein, complex carbs" },
  { period: "Afternoon", time: "2 – 5 PM", description: "Hydrating fruits, digestion-aiding items" },
  { period: "Evening", time: "5 – 7 PM", description: "Light veggies, low-fat, antioxidant foods" },
  { period: "Night", time: "7 – 9 PM", description: "Easily digestible, calming foods" },
];

export default function HealthBenefitsPage() {
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo<Crop | null>(() => {
    setError(null);
    if (!search.trim()) return null;
    const term = search.toLowerCase().replace(/[()]/g, "").trim();
    const match = cropData.find((c) =>
      c.commonName.toLowerCase().replace(/[()]/g, "").includes(term)
    );
    if (!match) {
      setError("No nutrition data for that crop yet.");
      return null;
    }
    return match;
  }, [search]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Health & nutrition"
        title="What does this crop give you?"
        subtitle="Search any crop to see its health benefits, macronutrients, vitamins, ideal time to eat, and shelf life."
      />

      <div className="max-w-2xl mb-8 relative">
        <Label htmlFor="health-search" className="sr-only">
          Search Crop
        </Label>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <Input
          id="health-search"
          type="text"
          placeholder="Search a crop (e.g. Mango, Spinach, Pear)…"
          className="pl-11 py-5 bg-white border-stone-300 focus-visible:ring-stone-900 focus-visible:border-stone-900 rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AnimatePresence>
        {error && !selected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm flex gap-2 max-w-md"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-8"
              >
                <header>
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">
                    {selected.scientificName}
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight text-stone-900">
                    {selected.commonName}
                  </h2>
                </header>

                {/* Health benefits */}
                {selected.healthBenefits && (
                  <Section title="Health benefits">
                    <ul className="space-y-2.5">
                      {Object.values(selected.healthBenefits)
                        .filter((b): b is string => Boolean(b))
                        .map((benefit, i) => (
                          <li key={i} className="flex gap-2.5 text-stone-700 leading-relaxed text-sm">
                            <span className="text-stone-400 flex-shrink-0">•</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                    </ul>
                  </Section>
                )}

                {/* Macros */}
                {(selected.carbohydrates != null ||
                  selected.proteins != null ||
                  selected.fats != null) && (
                  <Section
                    title="Macronutrients"
                    hint="per 100 g edible portion"
                  >
                    <div className="grid grid-cols-3 gap-3">
                      <Macro label="Carbs" value={selected.carbohydrates} unit="g" />
                      <Macro label="Protein" value={selected.proteins} unit="g" />
                      <Macro label="Fat" value={selected.fats} unit="g" />
                    </div>
                    <p className="text-xs text-stone-400 mt-3">
                      Source: NIN/ICMR Indian Food Composition Tables, USDA.
                    </p>
                  </Section>
                )}

                {/* Vitamins + minerals */}
                {(selected.vitamins?.length || selected.minerals?.length) && (
                  <Section title="Rich in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {selected.vitamins && selected.vitamins.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">
                            Vitamins
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {selected.vitamins.map((v, i) => (
                              <span key={i} className="bg-stone-100 text-stone-800 text-xs px-2.5 py-1 rounded-full">
                                {v}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selected.minerals && selected.minerals.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">
                            Minerals
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {selected.minerals.map((m, i) => (
                              <span key={i} className="bg-stone-100 text-stone-800 text-xs px-2.5 py-1 rounded-full">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Section>
                )}

                {/* Best time + shelf life */}
                {(selected.bestTimeToConsume || selected.shelfLife) && (
                  <Section title="When and how">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selected.bestTimeToConsume && (
                        <Detail label="Best time to eat" value={selected.bestTimeToConsume} />
                      )}
                      {selected.shelfLife && (
                        <Detail label="Shelf life" value={selected.shelfLife} />
                      )}
                    </div>
                  </Section>
                )}
              </motion.div>
            ) : !error ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm p-12 text-center"
              >
                <Search className="h-8 w-8 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-700 font-medium mb-1">Search for a crop</p>
                <p className="text-stone-500 text-sm max-w-sm mx-auto">
                  Type a crop name to see its nutrition profile and health benefits.
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Sidebar — consumption times reference */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sticky top-20">
            <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-500 mb-4">
              <Clock className="w-3.5 h-3.5" />
              Consumption windows
            </h3>
            <ul className="space-y-3">
              {TIME_SLOTS.map((s) => (
                <li key={s.period} className="border-l-2 border-stone-200 pl-3">
                  <p className="text-sm font-semibold text-stone-900">{s.period}</p>
                  <p className="text-xs text-stone-500">{s.time}</p>
                  <p className="text-xs text-stone-600 mt-0.5 leading-snug">{s.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500">{title}</h3>
        {hint && <span className="text-xs text-stone-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Macro({ label, value, unit }: { label: string; value?: number; unit: string }) {
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
      <p className="text-2xl font-bold text-stone-900">
        {value ?? "—"}
        <span className="text-sm text-stone-400 font-normal ml-0.5">{unit}</span>
      </p>
      <p className="text-[11px] uppercase tracking-wider text-stone-500 mt-0.5">{label}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
      <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-1">{label}</p>
      <p className="text-stone-900 font-medium text-sm">{value}</p>
    </div>
  );
}
