import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory cache: avoid hammering the public Google Translate endpoint
// for repeated UI strings. Survives the lifetime of the serverless instance.
const cache = new Map<string, string>();

const SUPPORTED = new Set([
  "hi", "ta", "te", "bn", "gu", "kn", "ml", "mr", "pa", "or",
]);

export async function POST(request: NextRequest) {
  let body: { text?: string; targetLang?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = (body.text ?? "").toString();
  const targetLang = SUPPORTED.has(body.targetLang ?? "") ? body.targetLang! : "hi";

  if (!text.trim()) {
    return NextResponse.json({
      original: text,
      translated: text,
      sourceLang: "en",
      targetLang,
      error: "No text to translate",
    });
  }

  const cacheKey = `${targetLang}:${text}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json({
      original: text,
      translated: cached,
      sourceLang: "en",
      targetLang,
      cached: true,
    });
  }

  try {
    // Dynamic import — the package is ESM-only, so we can't statically import it.
    const mod = (await import("@vitalets/google-translate-api")) as unknown as {
      translate: (input: string, opts: { to: string }) => Promise<{ text: string }>;
    };
    const res = await mod.translate(text, { to: targetLang });

    cache.set(cacheKey, res.text);
    if (cache.size > 5000) {
      // Keep the cache bounded — drop oldest insertion.
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) cache.delete(firstKey);
    }

    return NextResponse.json({
      original: text,
      translated: res.text,
      sourceLang: "en",
      targetLang,
      success: true,
    });
  } catch (err) {
    console.error("Google Translate API error:", err);
    // Graceful fallback — return original so UI doesn't break.
    return NextResponse.json({
      original: text,
      translated: text,
      sourceLang: "en",
      targetLang,
      error: "Translation service error",
      fallback: true,
    });
  }
}
