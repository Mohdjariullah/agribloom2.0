// /app/api/farmer/trends/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/dbConfig";
import CropEntryModel, { ICropEntry } from "@/models/CropEntry";
import { getDataFromToken } from "@/helpers/getDataFromToken";

// Days that count as "recent" when measuring whether a crop is rising or
// falling in the area. Entries newer than this are compared against the
// equally-long window just before it.
const RECENT_WINDOW_DAYS = 120;

function entryTime(e: ICropEntry): number {
  // Prefer the agronomic sowing date; fall back to record creation time.
  const d =
    (e.sowingDate && new Date(e.sowingDate).getTime()) ||
    (e as unknown as { createdAt?: Date }).createdAt?.getTime?.() ||
    0;
  return Number.isFinite(d) ? d : 0;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    const { id: userId, role } = await getDataFromToken(request);
    let entries: ICropEntry[] = [];

    if (role === "admin") {
      entries = await CropEntryModel.find();
    } else {
      const farmerEntries = await CropEntryModel.find({ farmerId: userId });
      if (farmerEntries.length === 0) return NextResponse.json([]);
      const district = farmerEntries[0].district;
      entries = await CropEntryModel.find({ district });
    }

    const now = Date.now();
    const windowMs = RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    const recentCutoff = now - windowMs;
    const priorCutoff = now - 2 * windowMs;

    const cropMap = new Map<
      string,
      { area: number; recentArea: number; priorArea: number; mine: boolean; entries: ICropEntry[] }
    >();
    let totalAreaAllCrops = 0;

    for (const entry of entries) {
      totalAreaAllCrops += entry.area;
      const key = entry.crop;
      const t = entryTime(entry);
      const cur =
        cropMap.get(key) ?? { area: 0, recentArea: 0, priorArea: 0, mine: false, entries: [] };
      cur.area += entry.area;
      if (t >= recentCutoff) cur.recentArea += entry.area;
      else if (t >= priorCutoff) cur.priorArea += entry.area;
      // Flag crops the requesting farmer has personally logged, so the
      // dashboard can mark them as "yours".
      if (String(entry.farmerId) === String(userId)) cur.mine = true;
      cur.entries.push(entry);
      cropMap.set(key, cur);
    }

    const trends = Array.from(cropMap, ([crop, v]) => {
      const totalEntries = v.entries.length;
      const averageArea = totalEntries > 0 ? v.area / totalEntries : 0;
      const percentage = totalAreaAllCrops > 0 ? (v.area / totalAreaAllCrops) * 100 : 0;

      // Direction of the area over time.
      let trend: "up" | "down" | "flat" | "new" = "flat";
      let changePct = 0;
      if (v.priorArea === 0 && v.recentArea > 0) {
        trend = "new";
      } else if (v.priorArea > 0) {
        changePct = ((v.recentArea - v.priorArea) / v.priorArea) * 100;
        if (changePct > 5) trend = "up";
        else if (changePct < -5) trend = "down";
        else trend = "flat";
      }

      return {
        crop,
        totalEntries,
        totalArea: v.area,
        averageArea,
        percentage,
        recentArea: v.recentArea,
        priorArea: v.priorArea,
        trend,
        changePct: Math.round(changePct),
        mine: v.mine,
        district: v.entries[0].district,
        village: v.entries[0].village,
      };
    }).sort((a, b) => b.totalArea - a.totalArea);

    return NextResponse.json(trends);
  } catch (error) {
    console.error("Error fetching crop trends:", error);
    return NextResponse.json([], { status: 500 });
  }
}
