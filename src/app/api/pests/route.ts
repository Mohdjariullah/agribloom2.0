import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/dbConfig";
import Pest from "@/models/Pest";
import type { PipelineStage } from "mongoose";

export const dynamic = "force-dynamic";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/pests?crop=Tomato&type=pest&q=blight&limit=&page=
//
// The source data stores one row per (pest, crop) pair, so a pest like
// "Aphids" appears dozens of times — once for every crop it attacks. We group
// by pest name here so the UI shows each pest ONCE with the full list of crops
// it affects, instead of 60 identical "Aphids" cards.
export async function GET(req: NextRequest) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const crop = searchParams.get("crop");
  const type = searchParams.get("type");
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(searchParams.get("limit") ?? 60), 200);
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);

  const match: Record<string, unknown> = {};
  if (crop) match.affectedCrops = new RegExp(`^${escapeRegex(crop)}$`, "i");
  if (type) match.type = type;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    match.$or = [{ name: rx }, { symptoms: rx }, { affectedCrops: rx }];
  }

  // Rank severities so we can keep the most severe variant's details.
  const severityRank: PipelineStage.AddFields["$addFields"]["_sevRank"] = {
    $switch: {
      branches: [
        { case: { $eq: ["$severity", "critical"] }, then: 4 },
        { case: { $eq: ["$severity", "high"] }, then: 3 },
        { case: { $eq: ["$severity", "medium"] }, then: 2 },
        { case: { $eq: ["$severity", "low"] }, then: 1 },
      ],
      default: 0,
    },
  };

  const pipeline: PipelineStage[] = [
    { $match: match },
    { $addFields: { _sevRank: severityRank } },
    // Sort so the most severe (and longest-symptom) row wins $first below.
    { $sort: { _sevRank: -1, name: 1 } },
    {
      $group: {
        _id: { $toLower: "$name" },
        name: { $first: "$name" },
        slug: { $first: "$slug" },
        type: { $first: "$type" },
        symptoms: { $first: "$symptoms" },
        effect: { $first: "$effect" },
        prevention: { $first: "$prevention" },
        _sevRank: { $first: "$_sevRank" },
        cropsNested: { $push: "$affectedCrops" },
      },
    },
    {
      $addFields: {
        affectedCrops: {
          $reduce: {
            input: "$cropsNested",
            initialValue: [],
            in: { $setUnion: ["$$value", { $ifNull: ["$$this", []] }] },
          },
        },
        severity: {
          $switch: {
            branches: [
              { case: { $eq: ["$_sevRank", 4] }, then: "critical" },
              { case: { $eq: ["$_sevRank", 3] }, then: "high" },
              { case: { $eq: ["$_sevRank", 2] }, then: "medium" },
              { case: { $eq: ["$_sevRank", 1] }, then: "low" },
            ],
            default: null,
          },
        },
      },
    },
    { $project: { cropsNested: 0, _sevRank: 0 } },
    { $sort: { name: 1 } },
    {
      $facet: {
        items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        meta: [{ $count: "total" }],
      },
    },
  ];

  try {
    const [result] = await Pest.aggregate(pipeline);
    const items = result?.items ?? [];
    const total = result?.meta?.[0]?.total ?? 0;
    return NextResponse.json({ items, total, page, limit });
  } catch (err) {
    console.error("GET /api/pests failed:", err);
    return NextResponse.json({ error: "Failed to fetch pests" }, { status: 500 });
  }
}
