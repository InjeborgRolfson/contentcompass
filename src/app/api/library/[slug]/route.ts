import { NextResponse } from 'next/server';
import { createSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createSupabase();

    const { data: entry, error } = await supabase
      .from('content_entries')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !entry) {
      console.error(' Supabase GET library item error:', error);
      return NextResponse.json({ 
        error: 'Content not found', 
        details: error 
      }, { status: error ? 500 : 404 });
    }

    return NextResponse.json(entry);
  } catch (error: any) {
    console.error(' CRITICAL error in GET library item:', error);
    return NextResponse.json(
      { error: 'Unexpected Server Error', message: error?.message || String(error) },
      { status: 500 }
    );
  }
}
