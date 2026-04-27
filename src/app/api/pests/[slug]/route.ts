import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/dbConfig";
import Pest from "@/models/Pest";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  await connectToDB();
  const { slug } = await params;
  const pest = await Pest.findOne({ slug }).lean();
  if (!pest) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pest);
}
