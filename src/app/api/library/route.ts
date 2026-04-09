import { NextResponse } from 'next/server';
import { createSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

const PAGE_SIZE = 24;

export async function GET(req: Request) {
  try {
    const supabase = createSupabase();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));

    let query = supabase
      .from('content_entries')
      .select('*', { count: 'exact' });

    if (type && type !== "all") {
      if (type.toLowerCase() === "youtube") {
        query = query.ilike('type', 'youtube%');
      } else {
        query = query.ilike('type', type);
      }
    }

    const { data: items, count, error } = await query
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error(' Supabase GET library error:', error);
      return NextResponse.json({ error: 'Database query failed', details: error.message }, { status: 500 });
    }


    return NextResponse.json({
      items,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / PAGE_SIZE),
    });
  } catch (error: any) {
    console.error(' CRITICAL error in GET library:', error);
    return NextResponse.json(
      { error: 'Unexpected Server Error', message: error?.message || String(error) },
      { status: 500 }
    );
  }
}
