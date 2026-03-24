import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ContentEntry from "@/models/ContentEntry";

export const runtime = "nodejs";

const PAGE_SIZE = 24;

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));

    const filter: Record<string, any> = {};
    if (type && type !== "all") {
      filter.type =
        type.toLowerCase() === "youtube"
          ? { $regex: /^youtube/i }
          : { $regex: new RegExp(`^${type}$`, "i") };
    }

    const [items, total] = await Promise.all([
      ContentEntry.find(filter)
        .sort({ createdAt: -1 })
        .skip(page * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean(),
      ContentEntry.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    console.error("Error fetching library:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
