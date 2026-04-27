import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/dbConfig";
import GovtScheme from "@/models/GovtScheme";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  await connectToDB();
  const { slug } = await params;
  const scheme = await GovtScheme.findOne({ slug }).lean();
  if (!scheme) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(scheme);
}
