import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  type Content,
  type FunctionCall,
  type FunctionResponsePart,
} from "@google/generative-ai";
import { TOOLS, SYSTEM_PROMPT } from "@/lib/chat/tools";
import { executeTool } from "@/lib/chat/executor";
import { connectToDB } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { LANGUAGES } from "@/lib/languages";
import { heuristicReply, type ChatProfile } from "@/lib/chat/heuristic";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type ChatMessage = { role: "user" | "model"; text: string };

const MAX_HOPS = 4;

// Load the signed-in user's profile (or null if anonymous / not found).
async function loadProfile(
  req: NextRequest
): Promise<{ profile: ChatProfile; username?: string; preferredLanguage?: string } | null> {
  try {
    const decoded = getDataFromToken(req);
    await connectToDB();
    const user = await User.findById(decoded.id)
      .select("username state district village primaryCrops farmSizeAcres preferredLanguage lat lon")
      .lean();
    if (!user) return null;
    return {
      profile: {
        state: user.state,
        district: user.district,
        primaryCrops: user.primaryCrops,
        lat: user.lat,
        lon: user.lon,
      },
      username: user.username,
      preferredLanguage: user.preferredLanguage,
    };
  } catch {
    return null;
  }
}

function buildPrompt(
  profile: ChatProfile | null,
  username?: string,
  preferredLanguage?: string
): string {
  if (!profile) return SYSTEM_PROMPT;
  const lines: string[] = [];
  if (username) lines.push(`Name: ${username}`);
  if (profile.state) lines.push(`State: ${profile.state}`);
  if (profile.district) lines.push(`District: ${profile.district}`);
  if (profile.primaryCrops?.length) lines.push(`Primary crops: ${profile.primaryCrops.join(", ")}`);
  if (profile.lat && profile.lon) lines.push(`Location: ${profile.lat.toFixed(3)}, ${profile.lon.toFixed(3)}`);
  if (preferredLanguage) {
    const langName = LANGUAGES.find((l) => l.code === preferredLanguage)?.name ?? preferredLanguage;
    lines.push(`Preferred language: ${langName}`);
  }
  if (lines.length === 0) return SYSTEM_PROMPT;
  return `${SYSTEM_PROMPT}

USER PROFILE (personalize answers — default state for prices, location for weather, prefer their crops):
${lines.map((l) => `- ${l}`).join("\n")}

When the user asks about prices/weather without a location, use their state/district. Reply in the user's preferred language unless they switch.`;
}

export async function POST(req: NextRequest) {
  let body: { message?: string; history?: ChatMessage[] } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) return NextResponse.json({ error: "message is required" }, { status: 400 });

  const history: ChatMessage[] = (body.history ?? []).slice(-12);
  const loaded = await loadProfile(req);
  const profile = loaded?.profile ?? {};
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  // No LLM configured → straight to the rule-based assistant.
  if (!apiKey) {
    const reply = await heuristicReply(message, profile);
    return NextResponse.json({ reply, mode: "heuristic" });
  }

  const systemInstruction = buildPrompt(profile, loaded?.username, loaded?.preferredLanguage);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction,
    tools: [{ functionDeclarations: TOOLS }],
  });

  const contents: Content[] = [
    ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: "user", parts: [{ text: message }] },
  ];
  const toolCallsLog: { name: string; args: unknown }[] = [];

  try {
    for (let hop = 0; hop < MAX_HOPS; hop += 1) {
      const result = await model.generateContent({ contents });
      const response = result.response;
      const calls: FunctionCall[] = response.functionCalls() ?? [];

      if (calls.length === 0) {
        return NextResponse.json({ reply: response.text(), toolCalls: toolCallsLog, mode: "llm" });
      }

      const responses: FunctionResponsePart[] = await Promise.all(
        calls.map(async (call) => {
          toolCallsLog.push({ name: call.name, args: call.args });
          const out = await executeTool(call.name, call.args as Record<string, unknown>);
          return { functionResponse: { name: call.name, response: { result: out } } };
        })
      );

      contents.push({ role: "model", parts: calls.map((c) => ({ functionCall: c })) });
      contents.push({ role: "user", parts: responses });
    }

    // Hop budget exhausted — fall back so the user still gets an answer.
    const reply = await heuristicReply(message, profile);
    return NextResponse.json({ reply, mode: "heuristic" });
  } catch (err) {
    // Gemini failed (quota / 429 / network). Degrade gracefully to the
    // rule-based assistant instead of erroring out to the user.
    console.warn("Chat LLM failed, using heuristic fallback:", err instanceof Error ? err.message : err);
    const reply = await heuristicReply(message, profile);
    return NextResponse.json({ reply, mode: "heuristic" });
  }
}
