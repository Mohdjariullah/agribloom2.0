import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/dbConfig";
import FertilizerGuide from "@/models/FertilizerGuide";

export const dynamic = "force-dynamic";

// GET /api/fertilizer
// GET /api/fertilizer?crop=tomato     (slug or name, case-insensitive)
export async function GET(req: NextRequest) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const crop = searchParams.get("crop");

  try {
    if (crop) {
      const slug = crop.toLowerCase().trim();
      const doc =
        (await FertilizerGuide.findOne({ cropSlug: slug }).lean()) ??
        (await FertilizerGuide.findOne({ cropName: new RegExp(`^${slug}$`, "i") }).lean());
      if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(doc);
    }
    const items = await FertilizerGuide.find({}).sort({ cropName: 1 }).lean();
    return NextResponse.json({ items, total: items.length });
  } catch (err) {
    console.error("GET /api/fertilizer failed:", err);
    return NextResponse.json({ error: "Failed to fetch fertilizer guides" }, { status: 500 });
  }
}
