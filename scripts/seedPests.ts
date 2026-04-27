/**
 * Seed `pests` and `fertilizer_guides` collections.
 *
 * Run: `npm run seed:pests`  (uses tsx)
 * Pass `--reset` to clear collections first.
 */

import { ensureDnsResolves } from "./_dnsFix"; // ← also loads .env.local
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Pest from "../src/models/Pest";
import FertilizerGuide from "../src/models/FertilizerGuide";

type RawCropEntry = {
  id: number;
  commonName: string;
  insects: { name: string; effect: string }[];
  solution: string[];
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[‐-―−]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Strip "contentReference[oaicite:N]" annotation noise from the JSON.
const cleanText = (s: string) =>
  s
    .replace(/:contentReference\[oaicite:\d+\]\{index=\d+\}/g, "")
    .replace(/\s+\./g, ".")
    .trim();

function severityFromEffect(effect: string): "low" | "medium" | "high" | "critical" {
  const e = effect.toLowerCase();
  if (/(100%|severe|wipe|destroy|catastrophic)/.test(e)) return "critical";
  if (/(\d{2,3})%/.test(e) && Number(RegExp.$1) >= 50) return "high";
  if (/(\d{2,3})%/.test(e)) return "medium";
  if (/yield loss|damage/.test(e)) return "medium";
  return "low";
}

// Lightweight ICAR-derived NPK defaults (kg/hectare) for top Indian crops.
// Source style: KVK general recommendations; intended as a starting point.
const FERT_DEFAULTS: Record<string, {
  N: number; P: number; K: number;
  doses: { name: string; dose: string; timing: string }[];
  organic?: string[];
  micro?: string;
}> = {
  rice: {
    N: 120, P: 60, K: 40,
    doses: [
      { name: "Urea", dose: "260 kg/ha total", timing: "1/3 basal + 1/3 tillering + 1/3 PI" },
      { name: "DAP", dose: "130 kg/ha", timing: "Basal" },
      { name: "MoP", dose: "67 kg/ha", timing: "Basal" },
    ],
    organic: ["FYM 10 t/ha", "Green manure (Sesbania)"],
    micro: "Zinc sulphate 25 kg/ha if deficient",
  },
  wheat: {
    N: 120, P: 60, K: 40,
    doses: [
      { name: "Urea", dose: "260 kg/ha", timing: "Half basal + half at first irrigation" },
      { name: "DAP", dose: "130 kg/ha", timing: "Basal" },
      { name: "MoP", dose: "67 kg/ha", timing: "Basal" },
    ],
    organic: ["FYM 10 t/ha"],
  },
  maize: {
    N: 150, P: 75, K: 50,
    doses: [
      { name: "Urea", dose: "325 kg/ha", timing: "1/3 basal + 1/3 knee-high + 1/3 tasseling" },
      { name: "SSP", dose: "470 kg/ha", timing: "Basal" },
      { name: "MoP", dose: "85 kg/ha", timing: "Basal" },
    ],
  },
  tomato: {
    N: 100, P: 50, K: 50,
    doses: [
      { name: "Urea", dose: "220 kg/ha", timing: "1/2 transplant + 1/4 30DAT + 1/4 60DAT" },
      { name: "DAP", dose: "110 kg/ha", timing: "Basal" },
      { name: "MoP", dose: "85 kg/ha", timing: "Basal" },
    ],
    organic: ["FYM 25 t/ha", "Vermicompost 5 t/ha"],
  },
  potato: {
    N: 150, P: 75, K: 100,
    doses: [
      { name: "Urea", dose: "325 kg/ha", timing: "Half basal + half earthing-up" },
      { name: "SSP", dose: "470 kg/ha", timing: "Basal" },
      { name: "MoP", dose: "170 kg/ha", timing: "Basal" },
    ],
  },
  onion: {
    N: 100, P: 50, K: 50,
    doses: [
      { name: "Urea", dose: "220 kg/ha", timing: "1/2 transplant + 1/2 30DAT" },
      { name: "DAP", dose: "110 kg/ha", timing: "Basal" },
      { name: "MoP", dose: "85 kg/ha", timing: "Basal" },
    ],
  },
  cotton: {
    N: 120, P: 60, K: 60,
    doses: [
      { name: "Urea", dose: "260 kg/ha", timing: "1/2 basal + 1/2 squaring" },
      { name: "DAP", dose: "130 kg/ha", timing: "Basal" },
      { name: "MoP", dose: "100 kg/ha", timing: "Basal" },
    ],
  },
  sugarcane: {
    N: 250, P: 115, K: 115,
    doses: [
      { name: "Urea", dose: "545 kg/ha", timing: "1/3 planting + 1/3 tillering + 1/3 grand growth" },
      { name: "DAP", dose: "250 kg/ha", timing: "Basal" },
      { name: "MoP", dose: "190 kg/ha", timing: "Basal" },
    ],
  },
  groundnut: {
    N: 25, P: 50, K: 75,
    doses: [
      { name: "Urea", dose: "55 kg/ha", timing: "Basal" },
      { name: "SSP", dose: "315 kg/ha", timing: "Basal" },
      { name: "MoP", dose: "125 kg/ha", timing: "Basal" },
    ],
    organic: ["Rhizobium seed treatment"],
  },
  soybean: {
    N: 25, P: 60, K: 40,
    doses: [
      { name: "Urea", dose: "55 kg/ha", timing: "Basal" },
      { name: "DAP", dose: "130 kg/ha", timing: "Basal" },
      { name: "MoP", dose: "67 kg/ha", timing: "Basal" },
    ],
  },
  chickpea: {
    N: 20, P: 40, K: 20,
    doses: [
      { name: "Urea", dose: "44 kg/ha", timing: "Basal" },
      { name: "SSP", dose: "250 kg/ha", timing: "Basal" },
    ],
    organic: ["Rhizobium seed treatment"],
  },
  banana: {
    N: 200, P: 60, K: 200,
    doses: [
      { name: "Urea", dose: "435 kg/plant year", timing: "Split monthly" },
      { name: "SSP", dose: "375 kg/ha", timing: "Basal" },
      { name: "MoP", dose: "335 kg/ha", timing: "Split monthly" },
    ],
  },
  mango: {
    N: 100, P: 50, K: 100,
    doses: [
      { name: "Urea", dose: "1 kg/tree (10y+)", timing: "Pre-flowering + post-harvest" },
      { name: "SSP", dose: "2 kg/tree", timing: "Pre-flowering" },
      { name: "MoP", dose: "1 kg/tree", timing: "Pre-flowering" },
    ],
  },
  cabbage: {
    N: 120, P: 60, K: 60,
    doses: [
      { name: "Urea", dose: "260 kg/ha", timing: "1/2 transplant + 1/2 30DAT" },
      { name: "DAP", dose: "130 kg/ha", timing: "Basal" },
      { name: "MoP", dose: "100 kg/ha", timing: "Basal" },
    ],
  },
  brinjal: {
    N: 100, P: 50, K: 50,
    doses: [
      { name: "Urea", dose: "220 kg/ha", timing: "Split: basal + 30 + 60 DAT" },
      { name: "DAP", dose: "110 kg/ha", timing: "Basal" },
      { name: "MoP", dose: "85 kg/ha", timing: "Basal" },
    ],
  },
};

async function main() {
  const reset = process.argv.includes("--reset");
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  if (!uri) {
    console.error("❌ MONGODB_URI is not set.");
    process.exit(1);
  }
  ensureDnsResolves();
  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  if (reset) {
    await Promise.all([Pest.deleteMany({}), FertilizerGuide.deleteMany({})]);
    console.log("🗑  Cleared pests + fertilizer_guides");
  }

  // ─── Pests ───────────────────────────────────────
  const dataPath = path.join(process.cwd(), "src/data/insect.json");
  const raw: RawCropEntry[] = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  const seen = new Map<string, number>();
  let pestUpserts = 0;

  for (const entry of raw) {
    const cropName = entry.commonName;
    const cleanedSolutions = (entry.solution || []).map(cleanText).filter(Boolean);

    for (const insect of entry.insects || []) {
      let slug = slugify(`${insect.name}-${cropName}`);
      const dup = seen.get(slug);
      if (dup !== undefined) {
        seen.set(slug, dup + 1);
        slug = `${slug}-${dup + 1}`;
      } else {
        seen.set(slug, 0);
      }

      const doc = {
        slug,
        name: insect.name,
        type: "pest" as const,
        affectedCrops: [cropName],
        symptoms: cleanText(insect.effect),
        effect: cleanText(insect.effect),
        prevention: cleanedSolutions,
        chemicalControl: [],
        organicControl: [],
        severity: severityFromEffect(insect.effect),
      };

      const result = await Pest.updateOne({ slug }, { $set: doc }, { upsert: true });
      if (result.upsertedCount || result.modifiedCount) pestUpserts += 1;
    }
  }
  console.log(`✅ Seeded ${pestUpserts} pest entries`);

  // ─── Fertilizer guide ────────────────────────────
  let fertUpserts = 0;
  for (const [cropSlug, f] of Object.entries(FERT_DEFAULTS)) {
    const cropName = cropSlug.charAt(0).toUpperCase() + cropSlug.slice(1);
    const result = await FertilizerGuide.updateOne(
      { cropSlug },
      {
        $set: {
          cropSlug,
          cropName,
          nitrogenKgPerHectare: f.N,
          phosphorusKgPerHectare: f.P,
          potassiumKgPerHectare: f.K,
          recommendedFertilizers: f.doses,
          organicAlternatives: f.organic ?? [],
          micronutrients: f.micro,
        },
      },
      { upsert: true }
    );
    if (result.upsertedCount || result.modifiedCount) fertUpserts += 1;
  }
  console.log(`✅ Seeded ${fertUpserts} fertilizer guides`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
