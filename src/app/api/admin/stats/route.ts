import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Crop from "@/models/Crop";
import Pest from "@/models/Pest";
import GovtScheme from "@/models/GovtScheme";
import MandiPrice from "@/models/MandiPriceCache";
import CropEntry from "@/models/CropEntry";
import { getDataFromToken } from "@/helpers/getDataFromToken";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const decoded = getDataFromToken(req);
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDB();

  try {
    const [
      totalUsers,
      farmers,
      admins,
      verifiedUsers,
      profileCompleted,
      farmersWithState,
      totalCropEntries,
      totalCrops,
      totalPests,
      totalSchemes,
      totalMandiPrices,
      recentUsers,
      topStatesAgg,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "farmer" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ profileCompleted: true }),
      User.countDocuments({ role: "farmer", state: { $exists: true, $ne: "" } }),
      CropEntry.countDocuments({}),
      Crop.countDocuments({}),
      Pest.countDocuments({}),
      GovtScheme.countDocuments({}),
      MandiPrice.countDocuments({}),
      User.find({ role: "farmer" })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("username email state district createdAt profileCompleted")
        .lean(),
      User.aggregate([
        { $match: { role: "farmer", state: { $exists: true, $ne: "" } } },
        { $group: { _id: "$state", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const completionPct =
      farmers > 0 ? Math.round((profileCompleted / farmers) * 100) : 0;
    const verifiedPct =
      totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;

    return NextResponse.json({
      users: {
        total: totalUsers,
        farmers,
        admins,
        verified: verifiedUsers,
        verifiedPct,
        profileCompleted,
        completionPct,
        farmersWithState,
      },
      content: {
        crops: totalCrops,
        pests: totalPests,
        schemes: totalSchemes,
        mandiPriceRecords: totalMandiPrices,
        cropEntries: totalCropEntries,
      },
      recentFarmers: recentUsers.map((u) => ({
        id: String(u._id),
        username: u.username,
        email: u.email,
        state: u.state,
        district: u.district,
        createdAt: u.createdAt,
        profileCompleted: u.profileCompleted ?? false,
      })),
      topStates: (topStatesAgg as { _id: string; count: number }[]).map((s) => ({
        state: s._id,
        count: s.count,
      })),
    });
  } catch (err) {
    console.error("admin/stats failed:", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
