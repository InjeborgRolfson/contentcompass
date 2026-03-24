import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Recommendation from "@/models/Recommendation";

export const runtime = "nodejs";

const PAGE_SIZE = 12;

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));

    await dbConnect();
    const [items, total] = await Promise.all([
      Recommendation.find({ userId: session.user.id })
        .sort({ _id: -1 })
        .skip(page * PAGE_SIZE)
        .limit(PAGE_SIZE),
      Recommendation.countDocuments({ userId: session.user.id }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    console.error("Error fetching saved recommendations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    await dbConnect();

    // Check if already saved
    const existing = await Recommendation.findOne({
      userId: session.user.id,
      title: data.title,
      type: data.type,
    });

    if (existing) {
      if (data.savedFrom && existing.savedFrom !== data.savedFrom) {
        await Recommendation.updateOne(
          { _id: existing._id },
          { $set: { savedFrom: data.savedFrom } },
        );
      }
      return NextResponse.json({ message: "Already saved" }, { status: 200 });
    }

    const saved = await Recommendation.create({
      ...data,
      description: data.description || data.description_en || data.description_tr || "",
      why: data.why || data.why_en || data.why_tr || "",
      year: data.year || "unknown",
      userId: session.user.id,
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error("Error saving recommendation:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    await dbConnect();
    await Recommendation.deleteOne({ _id: id, userId: session.user.id });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
