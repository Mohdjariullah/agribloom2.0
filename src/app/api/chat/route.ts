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

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type ChatMessage = { role: "user" | "model"; text: string };

const MAX_HOPS = 4;

async function buildPersonalizedPrompt(req: NextRequest): Promise<string> {
  try {
    const decoded = getDataFromToken(req);
    await connectToDB();
    const user = await User.findById(decoded.id)
      .select("username state district village primaryCrops farmSizeAcres preferredLanguage lat lon")
      .lean();
    if (!user) return SYSTEM_PROMPT;

    const lines: string[] = [];
    if (user.username) lines.push(`Name: ${user.username}`);
    if (user.state) lines.push(`State: ${user.state}`);
    if (user.district) lines.push(`District: ${user.district}`);
    if (user.village) lines.push(`Village: ${user.village}`);
    if (user.primaryCrops?.length) lines.push(`Primary crops: ${user.primaryCrops.join(", ")}`);
    if (user.farmSizeAcres) lines.push(`Farm size: ${user.farmSizeAcres} acres`);
    if (user.lat && user.lon) lines.push(`Location: ${user.lat.toFixed(3)}, ${user.lon.toFixed(3)}`);
    if (user.preferredLanguage) {
      const langName = LANGUAGES.find((l) => l.code === user.preferredLanguage)?.name ?? user.preferredLanguage;
      lines.push(`Preferred language: ${langName}`);
    }
    if (lines.length === 0) return SYSTEM_PROMPT;

    return `${SYSTEM_PROMPT}

USER PROFILE (use this to personalize answers — default state for prices, default location for weather, prefer their crops in examples):
${lines.map((l) => `- ${l}`).join("\n")}

When the user asks about prices/weather without specifying a location, use their state/district above. When they ask "what should I grow", consider their state and the current season. Reply in the user's preferred language unless they switch.`;
  } catch {
    return SYSTEM_PROMPT;
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_GEMINI_API_KEY is not set in .env.local." },
      { status: 500 }
    );
  }

  let body: { message?: string; history?: ChatMessage[] } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) return NextResponse.json({ error: "message is required" }, { status: 400 });

  const history: ChatMessage[] = (body.history ?? []).slice(-12);

  const systemInstruction = await buildPersonalizedPrompt(req);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction,
    tools: [{ functionDeclarations: TOOLS }],
  });

  const contents: Content[] = [
    ...history.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const toolCallsLog: { name: string; args: unknown }[] = [];

  try {
    for (let hop = 0; hop < MAX_HOPS; hop += 1) {
      const result = await model.generateContent({ contents });
      const response = result.response;

      const calls: FunctionCall[] = response.functionCalls() ?? [];
      if (calls.length === 0) {
        return NextResponse.json({
          reply: response.text(),
          toolCalls: toolCallsLog,
        });
      }

      // Execute tool calls in parallel
      const responses: FunctionResponsePart[] = await Promise.all(
        calls.map(async (call) => {
          toolCallsLog.push({ name: call.name, args: call.args });
          const out = await executeTool(call.name, call.args as Record<string, unknown>);
          return {
            functionResponse: {
              name: call.name,
              response: { result: out },
            },
          };
        })
      );

      // Append model's tool-call turn + our tool responses
      contents.push({
        role: "model",
        parts: calls.map((c) => ({ functionCall: c })),
      });
      contents.push({ role: "user", parts: responses });
    }

    return NextResponse.json({
      reply: "I called several tools but couldn't reach a final answer. Try rephrasing your question.",
      toolCalls: toolCallsLog,
    });
  } catch (err) {
    console.error("Chat API error:", err);
    const msg = err instanceof Error ? err.message : "Chat failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
