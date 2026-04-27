/**
 * Seed the `crops` collection from src/data/agrilens.json.
 *
 * Run: `npx tsx scripts/seedCrops.ts` (or compile then `node dist/seedCrops.js`)
 * Requires MONGODB_URI in .env.local.
 *
 * Behaviour:
 *   - Upsert by `slug` (idempotent — re-runs are safe).
 *   - Pass `--reset` to drop the collection before seeding.
 */

import { ensureDnsResolves } from "./_dnsFix"; // ← also loads .env.local
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Crop, { Season, WaterRequirement, CropCategory } from "../src/models/Crop";

type RawCrop = {
  id: number;
  commonName: string;
  scientificName: string;
  season: string;
  sowingMonth: string;
  floweringPeriod: string;
  harvestingMonth: string;
  waterRequirementPerDayLiters: string;
  sunlightRequirement: string;
  soilType: string;
  image: string;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[‐-―−]/g, "-") // unicode dashes → ascii
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function parseSeasons(raw: string): Season[] {
  const lower = raw.toLowerCase();
  const set = new Set<Season>();
  if (lower.includes("kharif")) set.add("kharif");
  if (lower.includes("rabi")) set.add("rabi");
  if (lower.includes("zaid") || lower.includes("summer")) set.add("zaid");
  // "year-round" / "tropical" → all three
  if (lower.includes("year") || lower.includes("tropical")) {
    set.add("kharif");
    set.add("rabi");
    set.add("zaid");
  }
  return [...set];
}

function inferWaterRequirement(text: string): WaterRequirement | undefined {
  // Numbers like "4000-6000" extract the upper bound
  const match = text.match(/(\d{3,5})/g);
  if (!match) return undefined;
  const max = Math.max(...match.map(Number));
  if (max < 2000) return "low";
  if (max < 5000) return "medium";
  return "high";
}

function splitSoilTypes(text: string): string[] {
  return text
    .split(/[,\/;]| or |and /i)
    .map((s) => s.trim())
    .filter(Boolean);
}

function inferCategory(name: string): CropCategory {
  const n = name.toLowerCase();
  const cereals = ["rice", "wheat", "maize", "barley", "millet", "ragi", "jowar", "bajra", "sorghum"];
  const pulses = ["gram", "lentil", "moong", "urad", "tur", "arhar", "pea", "bean", "chickpea", "soyabean", "soybean"];
  const oilseeds = ["mustard", "sesame", "groundnut", "sunflower", "castor", "safflower", "linseed", "niger"];
  const spices = ["chilli", "chili", "pepper", "turmeric", "ginger", "cardamom", "clove", "coriander", "cumin", "fennel", "fenugreek"];
  const fruits = ["mango", "banana", "apple", "papaya", "guava", "grape", "pomegranate", "orange", "lemon", "lime", "litchi", "pineapple", "strawberry", "watermelon", "muskmelon"];
  const cash = ["cotton", "jute", "tobacco", "sugarcane", "tea", "coffee", "rubber"];
  if (cereals.some((c) => n.includes(c))) return "cereal";
  if (pulses.some((c) => n.includes(c))) return "pulse";
  if (oilseeds.some((c) => n.includes(c))) return "oilseed";
  if (spices.some((c) => n.includes(c))) return "spice";
  if (fruits.some((c) => n.includes(c))) return "fruit";
  if (cash.some((c) => n.includes(c))) return "cash_crop";
  return "vegetable";
}

async function main() {
  const reset = process.argv.includes("--reset");

  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  if (!uri) {
    console.error("❌ MONGODB_URI is not set. Add it to .env.local.");
    process.exit(1);
  }

  ensureDnsResolves();
  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  if (reset) {
    await Crop.deleteMany({});
    console.log("🗑  Cleared crops collection (--reset)");
  }

  const dataPath = path.join(process.cwd(), "src/data/agrilens.json");
  const raw: RawCrop[] = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  const seenSlugs = new Map<string, number>();
  let upserts = 0;
  let updates = 0;

  for (const r of raw) {
    let slug = slugify(r.commonName);
    const existing = seenSlugs.get(slug);
    if (existing !== undefined) {
      seenSlugs.set(slug, existing + 1);
      slug = `${slug}-${existing + 1}`;
    } else {
      seenSlugs.set(slug, 0);
    }

    const doc = {
      slug,
      name: r.commonName,
      scientificName: r.scientificName,
      category: inferCategory(r.commonName),
      season: parseSeasons(r.season),
      soilTypes: splitSoilTypes(r.soilType),
      waterRequirement: inferWaterRequirement(r.waterRequirementPerDayLiters),
      waterRequirementText: r.waterRequirementPerDayLiters,
      sowingMonth: r.sowingMonth,
      floweringPeriod: r.floweringPeriod,
      harvestingMonth: r.harvestingMonth,
      sunlightRequirement: r.sunlightRequirement,
      imageUrl: r.image,
      states: [],
      seedVarieties: [],
    };

    const result = await Crop.updateOne({ slug }, { $set: doc }, { upsert: true });
    if (result.upsertedCount) upserts += 1;
    else if (result.modifiedCount) updates += 1;
  }

  console.log(`✅ Seeded ${raw.length} crops (${upserts} new, ${updates} updated)`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
