import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/dbConfig";
import Crop from "@/models/Crop";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import type { FilterQuery } from "mongoose";
import type { ICrop } from "@/models/Crop";

export const dynamic = "force-dynamic";

// GET /api/crops?state=&season=&soil=&category=&q=&limit=&page=
export async function GET(req: NextRequest) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state");
  const season = searchParams.get("season");
  const soil = searchParams.get("soil");
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);

  const filter: FilterQuery<ICrop> = {};
  if (state) filter.states = state;
  if (season) filter.season = season.toLowerCase();
  if (soil) filter.soilTypes = { $regex: new RegExp(soil, "i") };
  if (category) filter.category = category;
  if (q) filter.$text = { $search: q };

  try {
    const [items, total] = await Promise.all([
      Crop.find(filter)
        .sort(q ? { score: { $meta: "textScore" } } : { name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Crop.countDocuments(filter),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    });
  } catch (err) {
    console.error("GET /api/crops failed:", err);
    return NextResponse.json({ error: "Failed to fetch crops" }, { status: 500 });
  }
}

// POST /api/crops — admin-only create
export async function POST(req: NextRequest) {
  await connectToDB();

  try {
    const decoded = getDataFromToken(req);
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body?.name || !body?.slug) {
      return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
    }
    const created = await Crop.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create crop";
    const status = msg.includes("duplicate key") ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
