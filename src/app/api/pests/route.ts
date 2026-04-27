import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/dbConfig";
import Pest from "@/models/Pest";
import type { FilterQuery } from "mongoose";
import type { IPest } from "@/models/Pest";

export const dynamic = "force-dynamic";

// GET /api/pests?crop=Tomato&type=pest&q=blight&limit=&page=
export async function GET(req: NextRequest) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const crop = searchParams.get("crop");
  const type = searchParams.get("type");
  const q = searchParams.get("q");
  const limit = Math.min(Number(searchParams.get("limit") ?? 60), 200);
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);

  const filter: FilterQuery<IPest> = {};
  if (crop) filter.affectedCrops = new RegExp(`^${crop}$`, "i");
  if (type) filter.type = type;
  if (q) filter.$text = { $search: q };

  try {
    const [items, total] = await Promise.all([
      Pest.find(filter)
        .sort(q ? { score: { $meta: "textScore" } } : { name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Pest.countDocuments(filter),
    ]);
    return NextResponse.json({ items, total, page, limit });
  } catch (err) {
    console.error("GET /api/pests failed:", err);
    return NextResponse.json({ error: "Failed to fetch pests" }, { status: 500 });
  }
}
