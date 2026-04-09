import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createSupabase } from '@/lib/supabase';


export const runtime = 'nodejs';

const PAGE_SIZE = 12;


export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabase();
    const { searchParams } = new URL(req.url);
    const page = Math.max(0, parseInt(searchParams.get('page') ?? '0', 10));

    // Supabase query for favorites with pagination and count
    const { data: items, count: total, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('id', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error(' Supabase GET favorites error:', error);
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
    console.error(' CRITICAL error in GET favorites:', error);
    return NextResponse.json({
      error: 'Unexpected Server Error',
      message: error?.message || String(error)
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabase();
    const data = await req.json();
    
    const { creatorMode, id, ...sanitizedData } = data;

    const { error, data: favorite } = await supabase
      .from('favorites')
      .insert({
        ...sanitizedData,
        user_id: session.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error(' Supabase POST favorites error:', error);
      return NextResponse.json({ error: 'Database insertion failed', details: error.message }, { status: 500 });
    }


    return NextResponse.json(favorite, { status: 201 });
  } catch (error: any) {
    console.error(' CRITICAL error in POST favorites:', error);
    return NextResponse.json({ 
      error: 'Unexpected Server Error', 
      message: error?.message || String(error)
    }, { status: 500 });
  }
}


