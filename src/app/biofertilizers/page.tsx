"use client";

import React from "react";
import { motion } from "framer-motion";
import { CropImage } from "@/components/CropImage";
import { PageHeader, PageShell } from "@/components/PageHeader";

type Item = {
  id: number;
  name: string;
  benefit: string;
  microorganism?: string;
  crops: string;
  dosage: string;
  image: string;
  type: "biofertilizer" | "amendment";
};

const biofertilizers: Item[] = [
  { id: 1, name: "Rhizobium", benefit: "Fixes atmospheric nitrogen in legumes", microorganism: "Rhizobium spp.", crops: "Pulses — gram, lentil, moong, soybean", dosage: "Seed: 25 g/kg · Soil: 500 g/acre before sowing", image: "/nature/rhizobium.jpg", type: "biofertilizer" },
  { id: 2, name: "Azospirillum", benefit: "Nitrogen fixation + root growth", microorganism: "Azospirillum spp.", crops: "Cereals — maize, sorghum, pearl millet, sugarcane", dosage: "Seed: 20 g/kg · Soil: 2 kg/acre with compost", image: "/nature/azospirillum.jpg", type: "biofertilizer" },
  { id: 3, name: "Azotobacter", benefit: "Nitrogen fixation + growth hormones", microorganism: "Azotobacter spp.", crops: "Wheat, vegetables, cotton, fruits", dosage: "200 g–1 kg/acre once per crop; monthly for fruit trees", image: "/nature/azotobacter.jpg", type: "biofertilizer" },
  { id: 4, name: "Blue-Green Algae (BGA)", benefit: "Nitrogen fixation in flooded paddy", microorganism: "Anabaena, Nostoc", crops: "Paddy", dosage: "10–15 kg/ha, 7–10 days after transplanting", image: "/nature/bga.jpg", type: "biofertilizer" },
  { id: 5, name: "Mycorrhiza (VAM)", benefit: "Boosts P and micronutrient uptake", microorganism: "Glomus spp.", crops: "Mango, citrus, vegetables, spices", dosage: "Nursery: 5–10 g/plant · Field: 1 kg/acre", image: "/nature/mycorrhiza.jpg", type: "biofertilizer" },
  { id: 6, name: "Phosphate Solubilizing Bacteria (PSB)", benefit: "Unlocks soil phosphorus", microorganism: "Bacillus megaterium", crops: "Cereals, oilseeds, vegetables", dosage: "200 g–1 kg/acre or 25 g/kg seed", image: "/nature/psb.jpg", type: "biofertilizer" },
  { id: 7, name: "Potash Mobilizing Bacteria (KMB)", benefit: "Mobilizes potassium", microorganism: "Various", crops: "Banana, tomato, sugarcane, cereals", dosage: "1 kg/acre with compost", image: "/nature/kmb.jpg", type: "biofertilizer" },
  { id: 8, name: "Zinc Solubilizing Bacteria (ZSB)", benefit: "Releases bound zinc", microorganism: "Bacillus, Pseudomonas", crops: "Onion, mustard, cabbage, cereals", dosage: "1 kg/acre or 25 g/kg seed", image: "/nature/zsb.jpg", type: "biofertilizer" },
  { id: 9, name: "PGPR", benefit: "Boosts immunity + roots", microorganism: "Various", crops: "Vegetables, cereals, fruits", dosage: "100–200 g/acre as seed treatment or root dip", image: "/nature/pgpr.jpg", type: "biofertilizer" },

  { id: 10, name: "Neem Cake", benefit: "Natural pest repellent + slow N", crops: "Vegetables, pulses, fruits, oilseeds", dosage: "100–200 kg/acre · Pots: 25–50 g/plant monthly", image: "/nature/neem-khali.jpg", type: "amendment" },
  { id: 11, name: "Cocopeat", benefit: "Improves aeration & moisture retention", crops: "Nurseries, vegetables, flowers", dosage: "Mix 10–20% in soil; refresh every 3–4 months", image: "/nature/cocopeat.jpg", type: "amendment" },
  { id: 12, name: "Bone Meal", benefit: "P + Ca for flowering / rooting", crops: "Carrot, beet, rose, fruit trees", dosage: "100–150 kg/acre · 20–25 g/plant every 3–4 months", image: "/nature/bone-meal.jpg", type: "amendment" },
  { id: 13, name: "Fish Meal", benefit: "High organic nitrogen", crops: "Vegetables, fruit crops", dosage: "200–300 kg/acre split monthly", image: "/nature/fish-meal.jpg", type: "amendment" },
  { id: 14, name: "Panchagavya", benefit: "Plant immunity + soil microbes", crops: "All crops, especially organic farms", dosage: "Foliar 3% every 15 days · Soil drench monthly", image: "/nature/panchagavya.jpg", type: "amendment" },
  { id: 15, name: "Vermicompost", benefit: "Nutrient-rich organic manure", crops: "Vegetables, cereals, pulses, fruits", dosage: "2–4 tons/acre · Pots: 500 g–1 kg/month", image: "/nature/vermicompost.jpg", type: "amendment" },
  { id: 16, name: "Farm Yard Manure (FYM)", benefit: "Improves texture & fertility", crops: "All crops", dosage: "5–10 tons/acre/year", image: "/nature/fym.jpg", type: "amendment" },
  { id: 17, name: "Green Manure", benefit: "Adds organic matter + N", crops: "Paddy, sugarcane, oilseeds", dosage: "Plow in 45-day-old GM crop before main crop", image: "/nature/green-manure.jpg", type: "amendment" },
  { id: 18, name: "Seaweed Extracts", benefit: "Hormones + micronutrients", crops: "Fruits, vegetables, flowers", dosage: "Foliar 2–5 ml/L every 15–20 days", image: "/nature/seaweed.jpg", type: "amendment" },
  { id: 19, name: "Rock Phosphate", benefit: "Slow-release P", crops: "Pulses, oilseeds, acidic soils", dosage: "100–200 kg/acre at field prep", image: "/nature/rock-phosphate.jpg", type: "amendment" },
  { id: 20, name: "Wood Ash", benefit: "K source · raises pH", crops: "Root vegetables, fruit trees", dosage: "100–150 kg/acre · 1–2 handfuls/plant every 2–3 months", image: "/nature/wood-ash.jpg", type: "amendment" },
];

export default function BiofertilizersPage() {
  const live = biofertilizers.filter((b) => b.type === "biofertilizer");
  const amend = biofertilizers.filter((b) => b.type === "amendment");

  return (
    <PageShell>
      <PageHeader
        eyebrow="Biofertilizers & amendments"
        title="Sustainable inputs that work."
        subtitle="Living microbes and natural amendments that improve fertility, save chemicals, and protect soil long-term."
      />

      <Section title="Biofertilizers" hint="Living microbes">
        <Grid items={live} />
      </Section>

      <Section title="Organic amendments" hint="Non-living natural inputs">
        <Grid items={amend} />
      </Section>
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
    <section className="mb-12">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">{title}</h2>
        {hint && <span className="text-xs uppercase tracking-wider text-stone-500">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function Grid({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((b, i) => (
        <motion.div
          key={b.id}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.04 * i, duration: 0.25 }}
          className="bg-white rounded-2xl border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all overflow-hidden flex flex-col"
        >
          <div className="relative h-44 bg-stone-50">
            <CropImage src={b.image} alt={b.name} fill className="object-cover" />
          </div>
          <div className="p-5 space-y-3 flex-1">
            <div>
              <h3 className="font-semibold text-stone-900">{b.name}</h3>
              {b.microorganism && (
                <p className="text-xs text-stone-500 italic">{b.microorganism}</p>
              )}
            </div>
            <Row label="Benefit" value={b.benefit} />
            <Row label="Crops" value={b.crops} />
            <Row label="Dosage" value={b.dosage} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-0.5">{label}</p>
      <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{value}</p>
    </div>
  );
}
