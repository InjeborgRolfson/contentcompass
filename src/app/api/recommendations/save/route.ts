import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createSupabase } from "@/lib/supabase";
import { normalizeContentType } from "@/utils/content-type";

export const runtime = "nodejs";

const PAGE_SIZE = 12;

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createSupabase();

    const { searchParams } = new URL(req.url);
    const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));

    const { data: items, count: total, error } = await supabase
      .from('recommendations')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('id', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error(' Supabase GET saved recommendations error:', error);
      return NextResponse.json({ error: 'Database query failed', details: error.message }, { status: 500 });
    }


    return NextResponse.json({
      success: true,
      data: items,
      total: total || 0,
      page,
      totalPages: Math.ceil((total || 0) / PAGE_SIZE),
    });
  } catch (error: any) {
    console.error(" CRITICAL error in GET saved recommendations:", error);
    return NextResponse.json(
      { error: "Unexpected Server Error", message: error?.message || String(error) },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createSupabase();
    const data = await req.json();

    // Check if already saved
    const { data: existing } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('title', data.title)
      .eq('type', data.type)
      .single();

    if (existing) {
      if (data.savedFrom && existing.saved_from !== data.savedFrom) {
        await supabase
          .from('recommendations')
          .update({ saved_from: data.savedFrom })
          .eq('id', existing.id);
      }
      return NextResponse.json({ message: "Already saved" }, { status: 200 });
    }

    const { data: saved, error } = await supabase
      .from('recommendations')
      .insert({
        title: data.title,
        type: normalizeContentType(data.type || "Other"),
        creator: data.creator,
        year: data.year || "unknown",
        description: data.description || data.description_en || data.description_tr || "",
        why: data.why || data.why_en || data.why_tr || "",
        tags: data.tags || [],
        photo: data.photo,
        isWildcard: data.isWildcard || false,
        saved_from: data.savedFrom || "unknown",
        user_id: session.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error(' Supabase POST saved recommendation error:', error);
      return NextResponse.json({ error: 'Database insertion failed', details: error.message }, { status: 500 });
    }


    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error(" CRITICAL error in POST saved recommendation:", error);
    return NextResponse.json(
      { error: error?.message || "Unexpected Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createSupabase();
    const { id } = await req.json();
    const { error } = await supabase
      .from('recommendations')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error(' Supabase DELETE saved recommendation error:', error);
      return NextResponse.json({ error: 'Database deletion failed', details: error.message }, { status: 500 });
    }


    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    console.error(" CRITICAL error in DELETE saved recommendation:", error);
    return NextResponse.json(
      { error: "Unexpected Server Error", message: error?.message || String(error) },
      { status: 500 },
    );
  }
}


