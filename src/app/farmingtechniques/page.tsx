"use client";

import React from "react";
import { motion } from "framer-motion";
import { CropImage } from "@/components/CropImage";
import { PageHeader, PageShell } from "@/components/PageHeader";

type Technique = {
  title: string;
  badge: string;
  image: string;
  body: string[];
};

const techniques: Technique[] = [
  {
    title: "Grafting",
    badge: "Propagation",
    image: "/nature/grafting.jpg",
    body: [
      "Tissues from two different plants are joined so they grow as a single plant. Especially useful in fruit trees like mango, citrus and guava — the rootstock supplies disease resistance, the scion supplies fruit quality.",
      "Practiced for over 2,000 years; still essential in modern orchard management and rejuvenating older trees with improved varieties.",
    ],
  },
  {
    title: "Budding",
    badge: "Propagation",
    image: "/nature/budding.jpg",
    body: [
      "A single bud from one plant is inserted into the stem of another. Common in roses and citrus. Cheaper than full grafting, faster, and high success rate.",
      "Widely used in commercial nurseries because it needs minimal plant material to multiply superior varieties.",
    ],
  },
  {
    title: "Layering",
    badge: "Propagation",
    image: "/nature/layering.jpg",
    body: [
      "A stem is bent down and covered with soil while still attached to the parent plant. Roots form on the buried section; the rooted portion is then cut and transplanted. Useful when cuttings are hard to root — jasmine, lemon, hibiscus.",
      "An ancient technique that small-scale farmers still rely on; requires no tools.",
    ],
  },
  {
    title: "Tissue culture",
    badge: "Biotechnology",
    image: "/nature/tissue.jpg",
    body: [
      "A small piece of plant tissue is grown in sterile lab conditions on a nutrient medium. Produces disease-free, uniform plants quickly — banana, orchid, sugarcane, potato.",
      "Commercially viable since the 1960s. Today, the standard for export-quality, virus-free planting material.",
    ],
  },
  {
    title: "Bonsai",
    badge: "Horticulture",
    image: "/nature/bonsai.jpg",
    body: [
      "The Japanese art of growing miniature trees in containers — pruning, wiring, root trimming. Not commercial farming, but a specialized horticultural skill that builds patience and plant-care intuition.",
      "Originated in China 1,300+ years ago, refined in Japan, now practiced worldwide.",
    ],
  },
];

export default function FarmingTechniquesPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Farming techniques"
        title="Old methods, modern methods — and when to use each."
        subtitle="A short tour of the propagation and horticultural techniques every Indian farmer should recognize."
      />

      <div className="space-y-6 max-w-3xl">
        {techniques.map((t, i) => (
          <motion.article
            key={t.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.05 * i, duration: 0.3 }}
            className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
          >
            <div className="relative h-56 sm:h-64 bg-stone-50">
              <CropImage src={t.image} alt={t.title} fill className="object-cover" />
            </div>
            <div className="p-6 sm:p-8">
              <span className="inline-block text-[10px] uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full mb-3">
                {t.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 mb-3">
                {t.title}
              </h2>
              <div className="space-y-3 text-stone-700 leading-relaxed">
                {t.body.map((p, pi) => (
                  <p key={pi}>{p}</p>
                ))}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </PageShell>
  );
}
