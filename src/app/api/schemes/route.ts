import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/dbConfig";
import GovtScheme from "@/models/GovtScheme";
import type { FilterQuery } from "mongoose";
import type { IGovtScheme } from "@/models/GovtScheme";

export const dynamic = "force-dynamic";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/schemes?type=&state=&target=&q=&limit=&page=
export async function GET(req: NextRequest) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const state = searchParams.get("state");
  const target = searchParams.get("target");
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(searchParams.get("limit") ?? 60), 200);
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);

  const filter: FilterQuery<IGovtScheme> = { status: "active" };
  if (type) filter.type = type;
  if (target) filter.targetFarmers = target;

  // Combine the state filter (match all-India OR this state) and the free-text
  // substring search via $and so neither clobbers the other.
  const and: FilterQuery<IGovtScheme>[] = [];
  if (state) {
    and.push({ $or: [{ applicableStates: { $size: 0 } }, { applicableStates: state }] });
  }
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    and.push({ $or: [{ name: rx }, { shortName: rx }, { description: rx }, { benefits: rx }] });
  }
  if (and.length) filter.$and = and;

  try {
    const [items, total] = await Promise.all([
      GovtScheme.find(filter)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      GovtScheme.countDocuments(filter),
    ]);
    return NextResponse.json({ items, total, page, limit });
  } catch (err) {
    console.error("GET /api/schemes failed:", err);
    return NextResponse.json({ error: "Failed to fetch schemes" }, { status: 500 });
  }
}
