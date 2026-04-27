import {
  SchemaType,
  type FunctionDeclaration,
} from "@google/generative-ai";

/**
 * Tool definitions exposed to Gemini function calling.
 * Names map 1:1 to handlers in `executor.ts`.
 */
export const TOOLS: FunctionDeclaration[] = [
  {
    name: "search_crops",
    description:
      "Look up Indian crops by name, season, soil type, or category. Returns name, season, water needs, sowing month, soil and ideal temperature. Use this for any crop guidance question.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: { type: SchemaType.STRING, description: "Crop name or keyword" },
        season: {
          type: SchemaType.STRING,
          description: "kharif | rabi | zaid",
        },
        category: { type: SchemaType.STRING, description: "cereal, pulse, vegetable, fruit, oilseed, spice, cash_crop" },
        state: { type: SchemaType.STRING, description: "Indian state name" },
        limit: { type: SchemaType.NUMBER, description: "Max results (default 5)" },
      },
    },
  },
  {
    name: "get_mandi_price",
    description:
      "Get today's wholesale mandi prices for a commodity in a state (and optional district) from the AGMARKNET feed. Returns rows of market, min, max, modal, date.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        commodity: { type: SchemaType.STRING, description: "Commodity name e.g. Tomato" },
        state: { type: SchemaType.STRING, description: "Indian state name e.g. Karnataka" },
        district: { type: SchemaType.STRING, description: "District (optional)" },
      },
      required: ["commodity", "state"],
    },
  },
  {
    name: "get_mandi_trend",
    description:
      "Get the N-day price trend (avg modal/min/max per day) for a commodity in a state, from the cache. Use after get_mandi_price when the user asks about price direction.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        commodity: { type: SchemaType.STRING },
        state: { type: SchemaType.STRING },
        days: { type: SchemaType.NUMBER, description: "1-30, default 7" },
      },
      required: ["commodity"],
    },
  },
  {
    name: "get_weather",
    description:
      "Get current weather + 5-day forecast for a latitude/longitude. Optionally include the user's state to also return crop-specific alerts (frost risk, rain during harvest, etc.).",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        lat: { type: SchemaType.NUMBER },
        lon: { type: SchemaType.NUMBER },
        state: { type: SchemaType.STRING, description: "Indian state name (optional, enables crop alerts)" },
      },
      required: ["lat", "lon"],
    },
  },
  {
    name: "search_pests",
    description:
      "Look up pests/diseases by crop name or by symptom keywords. Returns name, symptoms, prevention steps and severity.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        crop: { type: SchemaType.STRING, description: "Crop name (optional)" },
        query: { type: SchemaType.STRING, description: "Symptom keyword like 'leaf blight'" },
        limit: { type: SchemaType.NUMBER },
      },
    },
  },
  {
    name: "get_fertilizer",
    description:
      "Get NPK (nitrogen/phosphorus/potassium) targets and fertilizer dose schedule for a crop. Returns kg/ha and a per-stage application schedule.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        crop: { type: SchemaType.STRING, description: "Crop name e.g. wheat, tomato" },
      },
      required: ["crop"],
    },
  },
  {
    name: "search_schemes",
    description:
      "Search Indian government agricultural welfare schemes — subsidies, insurance, credit, training. Filter by type, target group (small/marginal/women/sc_st), or state. Returns name, benefits, eligibility, and official URL.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: { type: SchemaType.STRING, description: "Free-text query e.g. 'crop insurance', 'PM-KISAN'" },
        type: { type: SchemaType.STRING, description: "subsidy | insurance | credit | training | input_support | marketing | pension" },
        target: { type: SchemaType.STRING, description: "small | marginal | women | sc_st | all" },
        state: { type: SchemaType.STRING, description: "Indian state to include state-specific schemes" },
        limit: { type: SchemaType.NUMBER },
      },
    },
  },
];

export const SYSTEM_PROMPT = `You are AgriBloom Assistant, a practical advisor for Indian farmers.

Style:
- Be direct. Short sentences. No marketing language.
- Answer in the language of the user's question (Hindi, English, regional Indian languages).
- When you have data from a tool, cite the specifics (₹ price, market name, date) — don't be vague.
- If a tool returns no data, say so plainly and suggest a different search rather than guessing.
- For prices, always mention the date and source (AGMARKNET via data.gov.in).
- For pest/fertilizer advice, prefer the structured data from tools over your training knowledge.

Tools:
- search_crops, get_mandi_price, get_mandi_trend, get_weather, search_pests, get_fertilizer, search_schemes
- Call them whenever the user asks about a specific crop, market, weather, pest, fertilizer plan, or government scheme.
- Don't ask the user for clarification before trying a tool — make a reasonable guess and call.
- For scheme questions, surface the official URL and helpline so the user can apply directly.

Scope:
- Stick to Indian agriculture. If asked about something else, say AgriBloom only covers farming topics.
- Do not give medical, legal, or financial advice unrelated to farming.`;
