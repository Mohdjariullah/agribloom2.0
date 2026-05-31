import { connectToDB } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";

const ALLOWED_FIELDS = [
  // farming-relevant
  "state",
  "district",
  "village",
  "lat",
  "lon",
  "primaryCrops",
  "farmSizeAcres",
  "preferredLanguage",
  "phone",
  // legacy favorites (still accepted)
  "favoriteVegetable",
  "favoriteFruit",
  "favoriteTree",
  "favoriteFlower",
  "favoriteSeason",
  "favoriteActivity",
] as const;

// Profile is "complete" once the meaningful personalization field is set.
const REQUIRED_FOR_COMPLETION = ["state"] as const;

export async function GET(request: NextRequest) {
  await connectToDB();
  try {
    const decoded = getDataFromToken(request);
    const user = await User.findById(decoded.id).select("-password -verifyToken -verifyTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry");
    return NextResponse.json({ message: "User found", data: user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  await connectToDB();
  try {
    const decoded = getDataFromToken(request);
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    // Auto-mark profile completed once the user has set their state
    const current = await User.findById(decoded.id).lean();
    const merged = { ...(current ?? {}), ...updates };
    const allRequired = REQUIRED_FOR_COMPLETION.every((f) => {
      const v = merged[f as keyof typeof merged];
      return typeof v === "string" && v.trim() !== "";
    });
    if (allRequired) updates.profileCompleted = true;

    const updated = await User.findByIdAndUpdate(decoded.id, updates, {
      new: true,
    }).select("-password -verifyToken -verifyTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry");

    return NextResponse.json({ message: "Profile updated", user: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Profile update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
