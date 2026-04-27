/**
 * Executes Gemini tool calls by hitting Mongo + external APIs directly.
 * One handler per tool name in tools.ts.
 */

import { connectToDB } from "@/dbConfig/dbConfig";
import Crop from "@/models/Crop";
import Pest from "@/models/Pest";
import FertilizerGuide from "@/models/FertilizerGuide";
import MandiPrice from "@/models/MandiPriceCache";
import GovtScheme from "@/models/GovtScheme";
import {
  fetchAgmarknetPrices,
  parseArrivalDate,
  toNumberOrUndefined,
} from "@/lib/agmarknet";

type Args = Record<string, unknown>;
type Result = unknown;

async function search_crops(args: Args): Promise<Result> {
  await connectToDB();
  const filter: Record<string, unknown> = {};
  if (args.query) filter.$text = { $search: String(args.query) };
  if (args.season) filter.season = String(args.season).toLowerCase();
  if (args.category) filter.category = String(args.category);
  if (args.state) filter.states = String(args.state);
  const limit = Math.min(Number(args.limit ?? 5), 10);
  const items = await Crop.find(filter)
    .select(
      "name scientificName category season soilTypes idealTempMinC idealTempMaxC waterRequirement sowingMonth harvestingMonth"
    )
    .sort(args.query ? { score: { $meta: "textScore" } } : { name: 1 })
    .limit(limit)
    .lean();
  return { count: items.length, crops: items };
}

async function get_mandi_price(args: Args): Promise<Result> {
  const commodity = String(args.commodity ?? "").trim();
  const state = String(args.state ?? "").trim();
  const district = String(args.district ?? "").trim();
  if (!commodity || !state) return { error: "commodity and state are required" };

  await connectToDB();

  // Live fetch + upsert
  let liveError: string | null = null;
  try {
    const records = await fetchAgmarknetPrices({
      commodity,
      state,
      district: district || undefined,
      limit: 50,
    });
    if (records.length) {
      const ops = records
        .map((r) => {
          const arrivalDate = parseArrivalDate(r.arrival_date);
          if (!arrivalDate) return null;
          return {
            updateOne: {
              filter: {
                market: r.market,
                commodity: r.commodity,
                variety: r.variety ?? "",
                arrivalDate,
              },
              update: {
                $set: {
                  state: r.state,
                  district: r.district,
                  grade: r.grade ?? "",
                  minPrice: toNumberOrUndefined(r.min_price),
                  maxPrice: toNumberOrUndefined(r.max_price),
                  modalPrice: toNumberOrUndefined(r.modal_price),
                  fetchedAt: new Date(),
                },
              },
              upsert: true,
            },
          };
        })
        .filter(Boolean) as object[];
      if (ops.length) await MandiPrice.bulkWrite(ops, { ordered: false }).catch(() => {});
    }
  } catch (err) {
    liveError = err instanceof Error ? err.message : "AGMARKNET fetch failed";
  }

  const filter: Record<string, unknown> = {
    commodity: new RegExp(`^${commodity}$`, "i"),
    state: new RegExp(`^${state}$`, "i"),
  };
  if (district) filter.district = new RegExp(`^${district}$`, "i");
  const docs = await MandiPrice.find(filter).sort({ arrivalDate: -1 }).limit(20).lean();
  return {
    commodity,
    state,
    district: district || null,
    rows: docs.map((d) => ({
      market: d.market,
      district: d.district,
      min: d.minPrice ?? null,
      max: d.maxPrice ?? null,
      modal: d.modalPrice ?? null,
      date: d.arrivalDate ? new Date(d.arrivalDate).toISOString().slice(0, 10) : null,
    })),
    note: liveError ? `Live API error: ${liveError}` : undefined,
  };
}

async function get_mandi_trend(args: Args): Promise<Result> {
  const commodity = String(args.commodity ?? "").trim();
  if (!commodity) return { error: "commodity is required" };
  const state = String(args.state ?? "").trim();
  const days = Math.min(Math.max(Number(args.days ?? 7), 1), 30);

  await connectToDB();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  since.setUTCHours(0, 0, 0, 0);

  const match: Record<string, unknown> = {
    commodity: new RegExp(`^${commodity}$`, "i"),
    arrivalDate: { $gte: since },
  };
  if (state) match.state = new RegExp(`^${state}$`, "i");

  const points = await MandiPrice.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$arrivalDate" } },
        avgModal: { $avg: "$modalPrice" },
        avgMin: { $avg: "$minPrice" },
        avgMax: { $avg: "$maxPrice" },
        samples: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: "$_id",
        avgModal: { $round: ["$avgModal", 0] },
        avgMin: { $round: ["$avgMin", 0] },
        avgMax: { $round: ["$avgMax", 0] },
        samples: 1,
      },
    },
  ]);

  return { commodity, state, days, points };
}

async function get_weather(args: Args): Promise<Result> {
  const lat = Number(args.lat);
  const lon = Number(args.lon);
  const state = args.state ? String(args.state) : undefined;
  if (!Number.isFinite(lat) || !Number.isFinite(lon))
    return { error: "lat and lon are required" };

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return { error: "OPENWEATHER_API_KEY is not set" };

  const [curRes, fcRes] = await Promise.all([
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    ),
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    ),
  ]);
  if (!curRes.ok) return { error: `weather ${curRes.status}` };
  const cur = await curRes.json();
  const fc = fcRes.ok ? await fcRes.json() : { list: [] };

  const current = {
    temp: Math.round(cur.main.temp),
    humidity: cur.main.humidity,
    rain: cur.rain?.["1h"] ?? 0,
    condition: cur.weather?.[0]?.description ?? "—",
  };

  const byDay = new Map<string, { temps: number[]; rains: number[]; cond: string }>();
  for (const item of fc.list ?? []) {
    const date = item.dt_txt?.slice(0, 10);
    if (!date) continue;
    const e = byDay.get(date) ?? { temps: [], rains: [], cond: "" };
    e.temps.push(item.main.temp);
    e.rains.push(item.rain?.["3h"] ?? 0);
    if (!e.cond && item.weather?.[0]) e.cond = item.weather[0].description;
    byDay.set(date, e);
  }
  const forecast = [...byDay.entries()].slice(0, 5).map(([date, v]) => ({
    date,
    tempMin: Math.round(Math.min(...v.temps)),
    tempMax: Math.round(Math.max(...v.temps)),
    rainMm: Math.round(v.rains.reduce((a, b) => a + b, 0)),
    condition: v.cond,
  }));

  let cropAlerts: { crop: string; message: string }[] = [];
  if (state) {
    await connectToDB();
    const m = new Date().getUTCMonth() + 1;
    const season = m >= 6 && m <= 10 ? "kharif" : m >= 11 || m <= 3 ? "rabi" : "zaid";
    const crops = await Crop.find({ states: new RegExp(`^${state}$`, "i"), season }).lean();
    for (const c of crops) {
      if (typeof c.idealTempMinC === "number" && current.temp < c.idealTempMinC - 2) {
        cropAlerts.push({
          crop: c.name,
          message: `Temp ${current.temp}°C is below ${c.name}'s ideal min (${c.idealTempMinC}°C).`,
        });
      }
      if (typeof c.idealTempMaxC === "number" && current.temp > c.idealTempMaxC + 2) {
        cropAlerts.push({
          crop: c.name,
          message: `Temp ${current.temp}°C is above ${c.name}'s ideal max (${c.idealTempMaxC}°C).`,
        });
      }
    }
    cropAlerts = cropAlerts.slice(0, 5);
  }

  return { location: cur.name, current, forecast, cropAlerts };
}

async function search_pests(args: Args): Promise<Result> {
  await connectToDB();
  const filter: Record<string, unknown> = {};
  if (args.crop) filter.affectedCrops = new RegExp(`^${String(args.crop)}$`, "i");
  if (args.query) filter.$text = { $search: String(args.query) };
  const limit = Math.min(Number(args.limit ?? 5), 10);
  const items = await Pest.find(filter)
    .select("name affectedCrops symptoms prevention severity")
    .sort(args.query ? { score: { $meta: "textScore" } } : { name: 1 })
    .limit(limit)
    .lean();
  return { count: items.length, pests: items };
}

async function get_fertilizer(args: Args): Promise<Result> {
  await connectToDB();
  const crop = String(args.crop ?? "").toLowerCase().trim();
  if (!crop) return { error: "crop is required" };
  const doc =
    (await FertilizerGuide.findOne({ cropSlug: crop }).lean()) ??
    (await FertilizerGuide.findOne({ cropName: new RegExp(`^${crop}$`, "i") }).lean());
  if (!doc) return { error: `No fertilizer guide for ${crop}` };
  return doc;
}

async function search_schemes(args: Args): Promise<Result> {
  await connectToDB();
  const filter: Record<string, unknown> = { status: "active" };
  if (args.type) filter.type = String(args.type);
  if (args.target) filter.targetFarmers = String(args.target);
  if (args.state) {
    filter.$or = [
      { applicableStates: { $size: 0 } },
      { applicableStates: String(args.state) },
    ];
  }
  if (args.query) filter.$text = { $search: String(args.query) };
  const limit = Math.min(Number(args.limit ?? 5), 10);
  const items = await GovtScheme.find(filter)
    .select("slug name shortName type description benefits eligibility officialUrl helpline ministry targetFarmers")
    .sort(args.query ? { score: { $meta: "textScore" } } : { name: 1 })
    .limit(limit)
    .lean();
  return { count: items.length, schemes: items };
}

const HANDLERS: Record<string, (args: Args) => Promise<Result>> = {
  search_crops,
  get_mandi_price,
  get_mandi_trend,
  get_weather,
  search_pests,
  get_fertilizer,
  search_schemes,
};

export async function executeTool(name: string, args: Args): Promise<Result> {
  const handler = HANDLERS[name];
  if (!handler) return { error: `Unknown tool: ${name}` };
  try {
    return await handler(args);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Tool execution failed" };
  }
}
