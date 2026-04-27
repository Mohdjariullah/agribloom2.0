import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/dbConfig";
import MandiPrice from "@/models/MandiPriceCache";

export const dynamic = "force-dynamic";

// GET /api/mandi/trend?commodity=Tomato&state=Karnataka&market=&days=7
// Returns: [{ date: 'YYYY-MM-DD', avgModal, avgMin, avgMax, samples }]
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const commodity = searchParams.get("commodity");
  const state = searchParams.get("state") ?? "";
  const market = searchParams.get("market") ?? "";
  const days = Math.min(Math.max(Number(searchParams.get("days") ?? 7), 1), 30);

  if (!commodity) {
    return NextResponse.json({ error: "commodity is required" }, { status: 400 });
  }

  await connectToDB();

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  since.setUTCHours(0, 0, 0, 0);

  const match: Record<string, unknown> = {
    commodity: new RegExp(`^${commodity}$`, "i"),
    arrivalDate: { $gte: since },
  };
  if (state) match.state = new RegExp(`^${state}$`, "i");
  if (market) match.market = new RegExp(`^${market}$`, "i");

  try {
    const results = await MandiPrice.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$arrivalDate" },
          },
          avgModal: { $avg: "$modalPrice" },
          avgMin: { $avg: "$minPrice" },
          avgMax: { $avg: "$maxPrice" },
          samples: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          avgModal: { $round: ["$avgModal", 0] },
          avgMin: { $round: ["$avgMin", 0] },
          avgMax: { $round: ["$avgMax", 0] },
          samples: 1,
        },
      },
    ]);

    return NextResponse.json({ commodity, state, market, days, points: results });
  } catch (err) {
    console.error("Mandi trend error:", err);
    return NextResponse.json({ error: "Trend query failed" }, { status: 500 });
  }
}
