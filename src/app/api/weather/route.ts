import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/dbConfig";
import Crop, { type Season } from "@/models/Crop";

export const dynamic = "force-dynamic";

type CurrentWeather = {
  temp: number;
  feelsLike?: number;
  humidity: number;
  rain: number;
  condition: string;
  icon?: string;
};

type ForecastDay = {
  date: string;
  tempMin: number;
  tempMax: number;
  rainMm: number;
  condition: string;
  icon?: string;
};

type CropAlert = { crop: string; severity: "info" | "warn" | "danger"; message: string };

function currentSeason(d = new Date()): Season {
  const m = d.getUTCMonth() + 1; // 1-12
  if (m >= 6 && m <= 10) return "kharif";
  if (m >= 11 || m <= 3) return "rabi";
  return "zaid";
}

function generalAlert(temp: number, humidity: number, rain: number): string {
  const alerts: string[] = [];
  if (temp > 35) alerts.push("⚠️ High temperature — irrigate and shade crops.");
  else if (temp < 10) alerts.push("⚠️ Low temperature — protect from frost.");
  if (humidity > 80) alerts.push("⚠️ High humidity — watch for fungal diseases.");
  else if (humidity < 30) alerts.push("⚠️ Low humidity — increase irrigation.");
  if (rain > 15) alerts.push("⚠️ Heavy rain — check drainage.");
  else if (rain > 5) alerts.push("💧 Good rainfall — skip irrigation today.");
  return alerts.length ? alerts.join(" ") : "✅ Weather is favorable for field work.";
}

async function buildCropAlerts(temp: number, rain: number, state?: string): Promise<CropAlert[]> {
  if (!state) return [];
  await connectToDB();
  const season = currentSeason();
  const crops = await Crop.find({ states: new RegExp(`^${state}$`, "i"), season }).lean();
  const out: CropAlert[] = [];
  for (const c of crops) {
    if (typeof c.idealTempMinC === "number" && temp < c.idealTempMinC - 2) {
      out.push({ crop: c.name, severity: "warn", message: `Temp ${temp}°C is below ${c.name}'s ideal range (${c.idealTempMinC}°C+).` });
    }
    if (typeof c.idealTempMaxC === "number" && temp > c.idealTempMaxC + 2) {
      out.push({ crop: c.name, severity: "warn", message: `Temp ${temp}°C is above ${c.name}'s ideal range (${c.idealTempMaxC}°C max).` });
    }
    if (rain > 20 && c.harvestingMonth?.toLowerCase().includes(monthName(new Date()))) {
      out.push({ crop: c.name, severity: "danger", message: `Heavy rain during ${c.name} harvest window — consider early harvest.` });
    }
  }
  return out.slice(0, 6);
}

function monthName(d: Date) {
  return d.toLocaleString("en-US", { month: "short" }).toLowerCase();
}

async function fetchOpenWeather(lat: number, lon: number) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY is not set. Add it to .env.local.");
  }

  const [currentRes, forecastRes] = await Promise.all([
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
      { next: { revalidate: 600 } }
    ),
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
      { next: { revalidate: 1800 } }
    ),
  ]);

  if (!currentRes.ok) throw new Error(`OpenWeather current ${currentRes.status}`);
  if (!forecastRes.ok) throw new Error(`OpenWeather forecast ${forecastRes.status}`);

  const cur = await currentRes.json();
  const fc = await forecastRes.json();

  const current: CurrentWeather = {
    temp: Math.round(cur.main.temp),
    feelsLike: Math.round(cur.main.feels_like),
    humidity: cur.main.humidity,
    rain: cur.rain?.["1h"] ?? 0,
    condition: cur.weather?.[0]?.description ?? "—",
    icon: cur.weather?.[0]?.icon,
  };

  // 3-hourly → group into days
  const byDay = new Map<string, { temps: number[]; rains: number[]; cond: string; icon?: string }>();
  for (const item of fc.list ?? []) {
    const date = item.dt_txt?.slice(0, 10);
    if (!date) continue;
    const entry = byDay.get(date) ?? { temps: [], rains: [], cond: "", icon: undefined };
    entry.temps.push(item.main.temp);
    entry.rains.push(item.rain?.["3h"] ?? 0);
    if (!entry.cond && item.weather?.[0]) {
      entry.cond = item.weather[0].description;
      entry.icon = item.weather[0].icon;
    }
    byDay.set(date, entry);
  }

  const forecast: ForecastDay[] = [...byDay.entries()].slice(0, 5).map(([date, v]) => ({
    date,
    tempMin: Math.round(Math.min(...v.temps)),
    tempMax: Math.round(Math.max(...v.temps)),
    rainMm: Math.round(v.rains.reduce((a, b) => a + b, 0)),
    condition: v.cond,
    icon: v.icon,
  }));

  return { current, forecast, locationName: cur.name as string | undefined };
}

async function build(lat: number, lon: number, state?: string) {
  const { current, forecast, locationName } = await fetchOpenWeather(lat, lon);
  const cropAlerts = await buildCropAlerts(current.temp, current.rain, state);
  return {
    location: locationName ?? null,
    current,
    // Legacy alias for older components reading data.weather.* — keep until phased out.
    weather: current,
    forecast,
    alert: generalAlert(current.temp, current.humidity, current.rain),
    cropAlerts,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const lat = Number(body.lat);
    const lon = Number(body.lon);
    const state = typeof body.state === "string" ? body.state : undefined;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
    }
    return NextResponse.json(await build(lat, lon, state));
  } catch (err) {
    console.error("Weather API error:", err);
    const msg = err instanceof Error ? err.message : "Weather fetch failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const state = searchParams.get("state") ?? undefined;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }
  try {
    return NextResponse.json(await build(lat, lon, state));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Weather fetch failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
