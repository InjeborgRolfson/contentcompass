import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ContentEntry from "@/models/ContentEntry";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    await dbConnect();

    const entry = await ContentEntry.findOne({ slug }).lean();

    if (!entry) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error("Error fetching content entry:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
