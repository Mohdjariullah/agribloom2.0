"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Sprout, Droplets, FlaskConical, Leaf } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, PageShell } from "@/components/PageHeader";

type FertilizerDose = { name: string; dose: string; timing: string };
type FertilizerGuide = {
  cropSlug: string;
  cropName: string;
  nitrogenKgPerHectare?: number;
  phosphorusKgPerHectare?: number;
  potassiumKgPerHectare?: number;
  recommendedFertilizers: FertilizerDose[];
  organicAlternatives: string[];
  micronutrients?: string;
  soilPrepNotes?: string;
};

export default function FertilizerPage() {
  const [guides, setGuides] = useState<FertilizerGuide[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    axios
      .get("/api/fertilizer")
      .then((r) => {
        if (cancelled) return;
        const items: FertilizerGuide[] = r.data.items ?? [];
        setGuides(items);
        if (items.length) setSelectedSlug(items[0].cropSlug);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          axios.isAxiosError(err) ? err.response?.data?.error ?? err.message : "Failed to load"
        );
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => guides.find((g) => g.cropSlug === selectedSlug) ?? null,
    [guides, selectedSlug]
  );

  return (
    <PageShell>
      <PageHeader
        eyebrow="Fertilizer calculator"
        title="NPK targets and dose schedules per crop."
        subtitle="Drawn from standard ICAR / KVK recommendations. Pick a crop to see kg/hectare and timing."
      />

      {loading && <p className="text-stone-500 text-sm">Loading guides…</p>}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 max-w-md text-sm">
          {error}
        </div>
      )}

      {!loading && !error && guides.length > 0 && (
        <div className="max-w-md mb-8">
          <Select value={selectedSlug} onValueChange={setSelectedSlug}>
            <SelectTrigger className="w-full py-5 bg-white border-stone-300">
              <SelectValue placeholder="Select a crop" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {guides.map((g) => (
                <SelectItem key={g.cropSlug} value={g.cropSlug}>
                  {g.cropName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {!loading && guides.length === 0 && !error && (
        <div className="py-10 text-stone-500 max-w-md text-sm">
          <Sprout className="h-8 w-8 text-stone-300 mb-3" />
          <p>
            No fertilizer guides yet. Run{" "}
            <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs">npm run seed:pests</code>{" "}
            to populate.
          </p>
        </div>
      )}

      {selected && (
        <motion.div
          key={selected.cropSlug}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden"
        >
          <div className="p-6 sm:p-8 border-b border-stone-100">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">Per hectare</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
              {selected.cropName}
            </h2>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* NPK summary */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <NPK label="Nitrogen" value={selected.nitrogenKgPerHectare} accent="N" />
              <NPK label="Phosphorus" value={selected.phosphorusKgPerHectare} accent="P" />
              <NPK label="Potassium" value={selected.potassiumKgPerHectare} accent="K" />
            </div>

            {selected.recommendedFertilizers?.length > 0 && (
              <Section title="Application schedule" icon={<FlaskConical className="h-4 w-4" />}>
                <div className="overflow-x-auto -mx-2 px-2">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-stone-50 text-stone-600">
                        <Th>Fertilizer</Th>
                        <Th>Dose</Th>
                        <Th>Timing</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {selected.recommendedFertilizers.map((f, i) => (
                        <tr key={i} className="hover:bg-stone-50/60">
                          <td className="p-3 font-medium text-stone-900">{f.name}</td>
                          <td className="p-3 text-stone-700">{f.dose}</td>
                          <td className="p-3 text-stone-600">{f.timing}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {selected.organicAlternatives?.length > 0 && (
              <Section title="Organic alternatives" icon={<Leaf className="h-4 w-4" />}>
                <ul className="space-y-1.5 text-stone-700 text-sm list-disc list-inside">
                  {selected.organicAlternatives.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </Section>
            )}

            {selected.micronutrients && (
              <Section title="Micronutrients" icon={<Droplets className="h-4 w-4" />}>
                <p className="text-stone-700 text-sm">{selected.micronutrients}</p>
              </Section>
            )}

            {selected.soilPrepNotes && (
              <Section title="Soil prep" icon={<Sprout className="h-4 w-4" />}>
                <p className="text-stone-700 text-sm">{selected.soilPrepNotes}</p>
              </Section>
            )}
          </div>
        </motion.div>
      )}
    </PageShell>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-xs uppercase tracking-wider font-semibold p-3">{children}</th>
  );
}

function NPK({
  label,
  value,
  accent,
}: {
  label: string;
  value?: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-center">
      <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">
        <span className="font-mono text-stone-900">{accent}</span> · {label}
      </p>
      <p className="text-2xl sm:text-3xl font-bold text-stone-900">{value ?? "—"}</p>
      <p className="text-[10px] uppercase tracking-wider text-stone-400">kg / ha</p>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-stone-500 mb-3">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}
