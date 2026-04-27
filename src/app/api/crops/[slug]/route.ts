import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/dbConfig";
import Crop from "@/models/Crop";
import { getDataFromToken } from "@/helpers/getDataFromToken";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  await connectToDB();
  const { slug } = await params;
  const crop = await Crop.findOne({ slug }).lean();
  if (!crop) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(crop);
}

function requireAdmin(req: NextRequest) {
  const decoded = getDataFromToken(req);
  if (decoded.role !== "admin") {
    throw new Error("Forbidden");
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  await connectToDB();
  try {
    requireAdmin(req);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized";
    const status = msg === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: msg }, { status });
  }

  try {
    const { slug } = await params;
    const body = await req.json();
    const updated = await Crop.findOneAndUpdate({ slug }, { $set: body }, { new: true });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  await connectToDB();
  try {
    requireAdmin(req);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized";
    const status = msg === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: msg }, { status });
  }

  const { slug } = await params;
  const result = await Crop.deleteOne({ slug });
  if (!result.deletedCount) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
