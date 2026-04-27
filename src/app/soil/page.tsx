"use client";

import React from "react";
import { motion } from "framer-motion";
import { CropImage } from "@/components/CropImage";
import { PageHeader, PageShell } from "@/components/PageHeader";

const soilTypes = [
  {
    name: "Alluvial Soil",
    description:
      "The most fertile and widespread soil in India, covering ~40% of total land. Found in the Indo-Gangetic plains, Brahmaputra valley, and coastal regions. Rich in potash, phosphoric acid, and lime — but deficient in nitrogen.",
    regions: "Punjab, Haryana, Uttar Pradesh, Bihar, West Bengal, Assam, coastal regions",
    crops: "Rice, wheat, sugarcane, cotton, jute, oilseeds",
    image: "/nature/alluvial.jpg",
    ph: "6.5–8.4",
  },
  {
    name: "Black Soil (Regur)",
    description:
      "Often called 'black cotton soil' for its ideal cotton cultivation. Clay-heavy, rich in iron, lime, calcium, magnesium and potash. Excellent moisture retention, but low on nitrogen and organic matter.",
    regions: "Maharashtra, Gujarat, Madhya Pradesh, Karnataka, Andhra Pradesh, Tamil Nadu",
    crops: "Cotton, sugarcane, jowar, tobacco, wheat, oilseeds",
    image: "/nature/black.jpg",
    ph: "7.2–8.5",
  },
  {
    name: "Red Soil",
    description:
      "Develops on crystalline igneous rocks in low-rainfall areas. Iron diffusion gives the red colour. Porous and friable; deficient in nitrogen, phosphorus and humus, fairly rich in potash.",
    regions: "Tamil Nadu, Karnataka, Andhra Pradesh, Odisha, Jharkhand, Chhattisgarh",
    crops: "Groundnut, millet, potato, maize, pulses, tobacco",
    image: "/nature/red.jpg",
    ph: "5.5–7.5",
  },
  {
    name: "Laterite Soil",
    description:
      "Forms in high-temperature, heavy-rainfall regions. Intensely leached — poor in lime/silica, rich in iron oxide and aluminium. Generally infertile but workable with treatment.",
    regions: "Kerala, Karnataka, Tamil Nadu, Madhya Pradesh, Assam, Odisha",
    crops: "Tea, coffee, rubber, cashew, coconut",
    image: "/nature/laterite.jpg",
    ph: "4.5–6.0",
  },
  {
    name: "Arid / Desert Soil",
    description:
      "Sandy, porous, low in moisture and organic matter. Phosphate is OK but nitrogen is inadequate. Becomes productive with irrigation.",
    regions: "Rajasthan, Gujarat, Haryana, Punjab",
    crops: "Barley, millet, guar, pulses, wheat (with irrigation)",
    image: "/nature/arid.jpg",
    ph: "7.5–8.5",
  },
  {
    name: "Saline Soil",
    description:
      "Excess soluble salts inhibit plant growth. Develops in arid regions and waterlogged areas. Reclaimed by leaching salts and adding gypsum.",
    regions: "Gujarat, Rajasthan, Haryana, Punjab, Uttar Pradesh, coastal areas",
    crops: "Barley, cotton, sugarcane (after reclamation)",
    image: "/nature/saline.jpg",
    ph: ">8.5",
  },
  {
    name: "Peaty / Marshy Soil",
    description:
      "High-rainfall, high-humidity regions. Black, highly acidic, 10–40% organic matter. Usually waterlogged — needs drainage to farm.",
    regions: "Kerala, coastal Odisha, Tamil Nadu, Sundarbans (West Bengal)",
    crops: "Rice, coconut, vegetables (after drainage)",
    image: "/nature/marshy.jpg",
    ph: "3.5–5.0",
  },
  {
    name: "Forest Soil",
    description:
      "Hilly and mountainous regions covered with forests. Rich in humus but deficient in potash, phosphorus and lime. Generally acidic.",
    regions: "Himalayas, Western & Eastern Ghats, parts of the Peninsula",
    crops: "Tea, coffee, spices, tropical fruits",
    image: "/nature/forest.jpg",
    ph: "4.0–6.5",
  },
];

export default function SoilTypesPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Soil types"
        title="The 8 soil types behind Indian farming."
        subtitle="Each soil supports a distinct set of crops. Knowing yours sets up every other decision — irrigation, fertilizer, what to sow."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {soilTypes.map((soil, i) => (
          <motion.div
            key={soil.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.25 }}
            className="bg-white rounded-2xl border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all overflow-hidden"
          >
            <div className="relative h-44 bg-stone-50">
              <CropImage src={soil.image} alt={soil.name} fill className="object-cover" />
            </div>
            <div className="p-5">
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <h2 className="text-base font-semibold text-stone-900">{soil.name}</h2>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                  pH {soil.ph}
                </span>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                {soil.description}
              </p>

              <div className="space-y-2 text-sm">
                <Detail label="Found in" value={soil.regions} />
                <Detail label="Crops" value={soil.crops} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </PageShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-0.5">{label}</p>
      <p className="text-stone-700">{value}</p>
    </div>
  );
}
