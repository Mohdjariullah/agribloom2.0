import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/dbConfig";
import MandiPrice from "@/models/MandiPriceCache";
import {
  fetchAgmarknetPrices,
  parseArrivalDate,
  toNumberOrUndefined,
} from "@/lib/agmarknet";

export const dynamic = "force-dynamic";

type Body = { commodity?: string; state?: string; district?: string; market?: string };

type ResponseShape = {
  prices: {
    market: string;
    district: string;
    state: string;
    min: number;
    max: number;
    modal: number;
    date: string;
  }[];
  commodity: string;
  state: string;
  district: string;
  message: string;
  source: "live" | "cache";
};

async function handle(args: Required<Omit<Body, "market">> & { market?: string }): Promise<ResponseShape> {
  const { commodity, state, district, market } = args;

  await connectToDB();

  // 1. Try live AGMARKNET fetch
  let records: Awaited<ReturnType<typeof fetchAgmarknetPrices>> = [];
  let liveError: string | null = null;
  try {
    records = await fetchAgmarknetPrices({
      commodity: commodity || undefined,
      state: state || undefined,
      district: district || undefined,
      market,
      limit: 200,
    });
  } catch (err) {
    liveError = err instanceof Error ? err.message : "AGMARKNET fetch failed";
    console.warn("AGMARKNET live fetch failed:", liveError);
  }

  // 2. Upsert anything we got into the cache
  if (records.length > 0) {
    const ops = records
      .map((r) => {
        const arrivalDate = parseArrivalDate(r.arrival_date);
        if (!arrivalDate) return null;
        return {
          updateOne: {
            filter: {
              market: r.market,
              commodity: r.commodity,
              variety: r.variety ?? "",
              arrivalDate,
            },
            update: {
              $set: {
                state: r.state,
                district: r.district,
                grade: r.grade ?? "",
                minPrice: toNumberOrUndefined(r.min_price),
                maxPrice: toNumberOrUndefined(r.max_price),
                modalPrice: toNumberOrUndefined(r.modal_price),
                fetchedAt: new Date(),
              },
            },
            upsert: true,
          },
        };
      })
      .filter(Boolean) as object[];

    if (ops.length) {
      try {
        await MandiPrice.bulkWrite(ops, { ordered: false });
      } catch (err) {
        console.warn("MandiPrice bulkWrite warning:", err);
      }
    }
  }

  // 3. Build the response — prefer live records; fall back to cache for the same query
  const filter: Record<string, unknown> = {};
  if (commodity) filter.commodity = new RegExp(`^${commodity}$`, "i");
  if (state) filter.state = new RegExp(`^${state}$`, "i");
  if (district) filter.district = new RegExp(`^${district}$`, "i");
  if (market) filter.market = new RegExp(`^${market}$`, "i");

  const cacheDocs = await MandiPrice.find(filter)
    .sort({ arrivalDate: -1 })
    .limit(50)
    .lean();

  const prices = cacheDocs.map((d) => ({
    market: d.market,
    district: d.district,
    state: d.state,
    min: d.minPrice ?? 0,
    max: d.maxPrice ?? 0,
    modal: d.modalPrice ?? 0,
    date: d.arrivalDate ? new Date(d.arrivalDate).toISOString().slice(0, 10) : "",
  }));

  const source: "live" | "cache" = records.length > 0 ? "live" : "cache";
  let message: string;
  if (prices.length === 0) {
    message = liveError
      ? `No prices found. Live API error: ${liveError}`
      : `No price data available for "${commodity}" in "${state}".`;
  } else {
    message = `Found ${prices.length} price record${prices.length === 1 ? "" : "s"} (${source}).`;
  }

  return {
    prices,
    commodity,
    state,
    district,
    message,
    source,
  };
}

export async function POST(req: NextRequest) {
  let body: Body = {};
  try {
    body = await req.json();
  } catch {
    /* default empty */
  }
  const commodity = (body.commodity ?? "").trim();
  const state = (body.state ?? "").trim();
  const district = (body.district ?? "").trim();
  const market = (body.market ?? "").trim();

  try {
    const result = await handle({ commodity, state, district, market });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Mandi API error:", err);
    const msg = err instanceof Error ? err.message : "Mandi price fetch failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const commodity = searchParams.get("commodity") ?? "";
  const state = searchParams.get("state") ?? "";
  const district = searchParams.get("district") ?? "";
  const market = searchParams.get("market") ?? "";

  try {
    const result = await handle({ commodity, state, district, market });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Mandi API error:", err);
    const msg = err instanceof Error ? err.message : "Mandi price fetch failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
