import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectToDB } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type Status = "ok" | "missing" | "error";
type Check = { name: string; status: Status; detail?: string; ms?: number };

async function timed<T>(fn: () => Promise<T>): Promise<{ value?: T; error?: string; ms: number }> {
  const start = Date.now();
  try {
    const value = await fn();
    return { value, ms: Date.now() - start };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : String(err),
      ms: Date.now() - start,
    };
  }
}

function envCheck(name: string, present: boolean, hint?: string): Check {
  return present
    ? { name, status: "ok", detail: "set" }
    : { name, status: "missing", detail: hint ?? `Add ${name} to .env.local` };
}

async function checkMongo(): Promise<Check> {
  if (!(process.env.MONGODB_URI || process.env.MONGODB_URL)) {
    return { name: "MongoDB", status: "missing", detail: "MONGODB_URI not set" };
  }
  const r = await timed(async () => {
    await connectToDB();
    const count = await User.estimatedDocumentCount();
    return count;
  });
  if (r.error) return { name: "MongoDB", status: "error", detail: r.error, ms: r.ms };
  return { name: "MongoDB", status: "ok", detail: `connected, ${r.value} users`, ms: r.ms };
}

async function checkOpenWeather(): Promise<Check> {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return { name: "OpenWeatherMap", status: "missing", detail: "OPENWEATHER_API_KEY not set" };
  const r = await timed(async () => {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=12.97&lon=77.59&appid=${key}&units=metric`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text().catch(() => "")}`);
    const j = await res.json();
    return j.name ?? "ok";
  });
  if (r.error) return { name: "OpenWeatherMap", status: "error", detail: r.error, ms: r.ms };
  return { name: "OpenWeatherMap", status: "ok", detail: `Bengaluru → ${r.value}`, ms: r.ms };
}

async function checkDataGov(): Promise<Check> {
  const key = process.env.DATA_GOV_API_KEY;
  if (!key) return { name: "data.gov.in (AGMARKNET)", status: "missing", detail: "DATA_GOV_API_KEY not set" };
  const r = await timed(async () => {
    const res = await fetch(
      `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${key}&format=json&limit=1`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    return j.records?.length ?? 0;
  });
  if (r.error) return { name: "data.gov.in (AGMARKNET)", status: "error", detail: r.error, ms: r.ms };
  return { name: "data.gov.in (AGMARKNET)", status: "ok", detail: `${r.value} record returned`, ms: r.ms };
}

async function checkGemini(): Promise<Check> {
  const key = process.env.GOOGLE_GEMINI_API_KEY;
  if (!key) return { name: "Gemini Flash", status: "missing", detail: "GOOGLE_GEMINI_API_KEY not set" };
  const r = await timed(async () => {
    const ai = new GoogleGenerativeAI(key);
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const out = await model.generateContent("Reply with the single word: pong");
    return out.response.text().trim();
  });
  if (r.error) {
    const detail = r.error;
    // 429 means key works but quota hit — treat as ok with note
    if (detail.includes("429") || detail.toLowerCase().includes("quota")) {
      return {
        name: "Gemini Flash",
        status: "ok",
        detail: `key valid (free-tier quota exhausted — resets in <24h)`,
        ms: r.ms,
      };
    }
    return { name: "Gemini Flash", status: "error", detail, ms: r.ms };
  }
  return { name: "Gemini Flash", status: "ok", detail: `replied "${r.value}"`, ms: r.ms };
}

async function checkResend(): Promise<Check> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { name: "Resend", status: "missing", detail: "RESEND_API_KEY not set" };
  // Resend has a /domains GET that any valid key can hit without sending mail.
  const r = await timed(async () => {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text().catch(() => "")}`);
    const j = await res.json();
    return Array.isArray(j.data) ? j.data.length : 0;
  });
  if (r.error) return { name: "Resend", status: "error", detail: r.error, ms: r.ms };
  return { name: "Resend", status: "ok", detail: `${r.value} domain(s) configured`, ms: r.ms };
}

export async function GET(req: NextRequest) {
  // Admin-only
  try {
    const decoded = getDataFromToken(req);
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checks: Check[] = [
    envCheck("TOKEN_SECRET", !!(process.env.TOKEN_SECRET || process.env.JWT_SECRET)),
    envCheck("ADMIN_SECRET_KEY", !!process.env.ADMIN_SECRET_KEY),
    envCheck("RESEND_FROM_EMAIL", !!process.env.RESEND_FROM_EMAIL),
    envCheck("DOMAIN", !!process.env.DOMAIN),
    await checkMongo(),
    await checkOpenWeather(),
    await checkDataGov(),
    await checkResend(),
    await checkGemini(),
  ];

  const summary = {
    ok: checks.filter((c) => c.status === "ok").length,
    missing: checks.filter((c) => c.status === "missing").length,
    error: checks.filter((c) => c.status === "error").length,
  };

  return NextResponse.json({ summary, checks });
}
