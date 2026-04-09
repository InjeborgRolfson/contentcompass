import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabase();

    const { data: seenItems, error } = await supabase
      .from('seen_content')
      .select('*')
      .eq('user_id', session.user.id)
      .order('seen_at', { ascending: false });

    if (error) {
      console.error(' Supabase GET seen content error:', error);
      return NextResponse.json({ error: 'Database query failed', details: error.message }, { status: 500 });
    }


    return NextResponse.json(seenItems || []);
  } catch (error: any) {
    console.error(' CRITICAL error in GET seen content:', error);
    return NextResponse.json(
      { error: 'Unexpected Server Error', message: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabase();
    const { title, type } = await req.json();

    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }

    // Check if already marked as seen
    const { data: existing, error: checkError } = await supabase
      .from('seen_content')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('title', title)
      .eq('type', type)
      .maybeSingle();

    if (checkError) {
      console.error(' Supabase check seen error:', checkError);
      return NextResponse.json({ error: 'Database check failed', details: checkError.message }, { status: 500 });
    }


    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const { data: seenContent, error: insertError } = await supabase
      .from('seen_content')
      .insert({
        user_id: session.user.id,
        title,
        type,
      })
      .select()
      .single();

    if (insertError) {
      console.error(' Supabase POST seen content error:', insertError);
      return NextResponse.json({ error: 'Database insertion failed', details: insertError.message }, { status: 500 });
    }


    return NextResponse.json(seenContent, { status: 201 });
  } catch (error: any) {
    console.error(' CRITICAL error in POST seen content:', error);
    return NextResponse.json(
      { error: 'Unexpected Server Error', message: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabase();
    const { title, type } = await req.json();

    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('seen_content')
      .delete()
      .eq('user_id', session.user.id)
      .eq('title', title)
      .eq('type', type);

    if (deleteError) {
      console.error(' Supabase DELETE seen content error:', deleteError);
      return NextResponse.json({ error: 'Database deletion failed', details: deleteError.message }, { status: 500 });
    }


    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error(' CRITICAL error in DELETE seen content:', error);
    return NextResponse.json(
      { error: 'Unexpected Server Error', message: error?.message || String(error) },
      { status: 500 }
    );
  }
}


