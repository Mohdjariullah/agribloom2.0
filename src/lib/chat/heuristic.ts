/**
 * Rule-based fallback for the assistant.
 *
 * When the LLM is unavailable (no key, or Gemini 429 / error) we still want
 * the assistant to be useful. This detects the user's intent from keywords and
 * answers directly from the same DB tools the LLM would have called. It's not
 * conversational, but it reliably handles the common questions:
 * price, weather, scheme, pest, fertilizer, crop guide.
 */

import { executeTool } from "@/lib/chat/executor";

export type ChatProfile = {
  state?: string;
  district?: string;
  primaryCrops?: string[];
  lat?: number;
  lon?: number;
};

// Common commodities/crops we can spot in free text (lowercase).
const COMMODITIES = [
  "tomato", "potato", "onion", "rice", "paddy", "wheat", "maize", "corn", "cotton",
  "sugarcane", "soybean", "groundnut", "mustard", "chilli", "chili", "brinjal",
  "cabbage", "cauliflower", "banana", "mango", "apple", "grapes", "pomegranate",
  "turmeric", "ginger", "garlic", "peas", "gram", "chickpea", "lentil", "moong",
  "millet", "ragi", "jowar", "bajra", "coconut", "coffee", "tea", "okra", "carrot",
  "watermelon", "muskmelon", "papaya", "guava", "spinach", "cucumber",
];

const has = (text: string, words: string[]) => words.some((w) => text.includes(w));

function detectCommodity(text: string, profile: ChatProfile): string | null {
  const hit = COMMODITIES.find((c) => text.includes(c));
  if (hit) return hit.charAt(0).toUpperCase() + hit.slice(1);
  if (profile.primaryCrops?.length) return profile.primaryCrops[0];
  return null;
}

type Rows = { rows?: { market: string; modal?: number | null; min?: number | null; max?: number | null; date?: string | null }[]; note?: string };
type Schemes = { schemes?: { name: string; benefits?: string; officialUrl?: string; helpline?: string }[] };
type Pests = { pests?: { name: string; symptoms?: string; prevention?: string[] }[] };
type Crops = { crops?: { name: string; season?: string[]; soilTypes?: string[]; waterRequirement?: string; sowingMonth?: string }[] };
type Fert = { cropName?: string; nitrogenKgPerHectare?: number; phosphorusKgPerHectare?: number; potassiumKgPerHectare?: number; recommendedFertilizers?: { name: string; dose: string; timing: string }[]; error?: string };
type Weather = { location?: string; current?: { temp: number; condition: string; humidity: number }; forecast?: { date: string; tempMin: number; tempMax: number; rainMm: number }[]; cropAlerts?: { crop: string; message: string }[]; error?: string };

export async function heuristicReply(rawMessage: string, profile: ChatProfile): Promise<string> {
  const text = rawMessage.toLowerCase().trim();
  const state = profile.state || "Karnataka";

  // Greeting
  if (has(text, ["hello", "hi ", "hey", "namaste", "namaskar", "salaam"]) && text.length < 20) {
    return [
      "Namaste! I can help with:",
      "• Mandi prices — e.g. \"tomato price\"",
      "• Weather — e.g. \"weather this week\"",
      "• Government schemes — e.g. \"schemes for small farmers\"",
      "• Pests — e.g. \"pests on rice\"",
      "• Fertilizer — e.g. \"fertilizer for wheat\"",
      "Ask me anything about your crops.",
    ].join("\n");
  }

  // Mandi price
  if (has(text, ["price", "rate", "mandi", "bhav", "sell", "selling", "market"])) {
    const commodity = detectCommodity(text, profile);
    if (!commodity) return "Which crop's price do you want? For example: \"tomato price\".";
    const res = (await executeTool("get_mandi_price", { commodity, state })) as Rows;
    const rows = res.rows ?? [];
    if (!rows.length) {
      return `I couldn't find recent mandi prices for ${commodity} in ${state}. ${res.note ?? "Try another commodity or state."}`;
    }
    const top = rows.slice(0, 5).map((r) => `• ${r.market}: ₹${r.modal ?? "—"} (min ₹${r.min ?? "—"}, max ₹${r.max ?? "—"})`);
    return `${commodity} prices in ${state} (per quintal):\n${top.join("\n")}\n\nSource: AGMARKNET / data.gov.in.`;
  }

  // Weather
  if (has(text, ["weather", "rain", "mausam", "barish", "forecast", "temperature", "climate"])) {
    if (!profile.lat || !profile.lon) {
      return "To show your weather, set your location on the Weather page (it uses your phone's GPS once). Open Weather from the menu.";
    }
    const w = (await executeTool("get_weather", { lat: profile.lat, lon: profile.lon, state: profile.state })) as Weather;
    if (w.error || !w.current) return "Weather is unavailable right now. Please try the Weather page.";
    const lines = [`${w.location ?? "Your area"}: ${w.current.temp}°C, ${w.current.condition}, humidity ${w.current.humidity}%.`];
    if (w.forecast?.length) {
      lines.push("Next days: " + w.forecast.slice(0, 3).map((d) => `${d.date.slice(5)} ${d.tempMax}°/${d.tempMin}°${d.rainMm ? ` ${d.rainMm}mm` : ""}`).join(", "));
    }
    if (w.cropAlerts?.length) lines.push("⚠ " + w.cropAlerts.map((a) => a.message).join(" "));
    return lines.join("\n");
  }

  // Schemes
  if (has(text, ["scheme", "subsidy", "yojana", "pm-kisan", "pmkisan", "insurance", "loan", "credit", "kisan"])) {
    const res = (await executeTool("search_schemes", { query: rawMessage, state: profile.state, limit: 4 })) as Schemes;
    const schemes = res.schemes ?? [];
    if (!schemes.length) return "I couldn't find a matching scheme. Browse all schemes from the menu.";
    return (
      "Schemes that may help:\n" +
      schemes.map((s) => `• ${s.name}${s.benefits ? ` — ${s.benefits.slice(0, 90)}` : ""}${s.officialUrl ? `\n  Apply: ${s.officialUrl}` : ""}`).join("\n")
    );
  }

  // Pests / disease
  if (has(text, ["pest", "insect", "disease", "keeda", "bug", "blight", "rot", "fungus", "leaf"])) {
    const commodity = detectCommodity(text, profile);
    const args: Record<string, unknown> = { limit: 4 };
    if (commodity) args.crop = commodity;
    else args.query = rawMessage;
    const res = (await executeTool("search_pests", args)) as Pests;
    const pests = res.pests ?? [];
    if (!pests.length) return `No pest records found${commodity ? ` for ${commodity}` : ""}. Try the Pests page with the crop name.`;
    return (
      `Common problems${commodity ? ` on ${commodity}` : ""}:\n` +
      pests.map((p) => `• ${p.name}: ${(p.symptoms ?? "").slice(0, 90)}${p.prevention?.[0] ? `\n  Fix: ${p.prevention[0]}` : ""}`).join("\n")
    );
  }

  // Fertilizer
  if (has(text, ["fertilizer", "fertiliser", "npk", "khaad", "urea", "nutrient", "manure"])) {
    const commodity = detectCommodity(text, profile);
    if (!commodity) return "Which crop's fertilizer schedule do you need? e.g. \"fertilizer for wheat\".";
    const f = (await executeTool("get_fertilizer", { crop: commodity })) as Fert;
    if (f.error || !f.cropName) return `No fertilizer guide for ${commodity} yet. Try the Fertilizer page.`;
    const npk = `NPK target: ${f.nitrogenKgPerHectare ?? "—"}-${f.phosphorusKgPerHectare ?? "—"}-${f.potassiumKgPerHectare ?? "—"} kg/ha.`;
    const doses = (f.recommendedFertilizers ?? []).slice(0, 4).map((d) => `• ${d.name}: ${d.dose} (${d.timing})`);
    return `${f.cropName} — ${npk}\n${doses.join("\n")}`;
  }

  // Crop guide / what to grow
  if (has(text, ["grow", "sow", "plant", "crop", "season", "cultivat", "which"])) {
    const commodity = detectCommodity(text, profile);
    const args: Record<string, unknown> = { limit: 5 };
    if (commodity) args.query = commodity;
    const res = (await executeTool("search_crops", args)) as Crops;
    const crops = res.crops ?? [];
    if (!crops.length) return "Tell me a crop name and I'll share its season, soil and water needs. Or browse Crops from the menu.";
    return (
      "Crop guidance:\n" +
      crops.map((c) => `• ${c.name}: ${c.season?.join("/") ?? "—"} season, ${c.waterRequirement ?? "—"} water${c.sowingMonth ? `, sow ${c.sowingMonth}` : ""}`).join("\n")
    );
  }

  // Fallback menu
  return [
    "I can help with mandi prices, weather, government schemes, pests and fertilizer.",
    "Try: \"tomato price\", \"weather this week\", \"schemes for small farmers\", \"pests on rice\", or \"fertilizer for wheat\".",
  ].join("\n");
}
