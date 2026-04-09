import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabase();
    const data = await req.json();

    const { creatorMode, id: _, ...sanitizedData } = data;

    const { data: favorite, error } = await supabase
      .from('favorites')
      .update(sanitizedData)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error || !favorite) {
      console.error(' Supabase PATCH favorite error:', error);
      return NextResponse.json({ 
        error: 'Favorite update failed', 
        details: error?.message || 'Item not found' 
      }, { status: error ? 500 : 404 });
    }


    return NextResponse.json(favorite);
  } catch (error: any) {
    console.error(' CRITICAL error in PATCH favorite:', error);
    return NextResponse.json({ 
      error: 'Unexpected Server Error', 
      message: error?.message || String(error) 
    }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabase();

    const { error, count } = await supabase
      .from('favorites')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error || count === 0) {
      console.error(' Supabase DELETE favorite error:', error);
      return NextResponse.json({ 
        error: 'Favorite deletion failed', 
        details: error?.message || 'Item not found' 
      }, { status: error ? 500 : 404 });
    }


    return NextResponse.json({ message: 'Favorite deleted successfully' });
  } catch (error: any) {
    console.error(' CRITICAL error in DELETE favorite:', error);
    return NextResponse.json({ 
      error: 'Unexpected Server Error', 
      message: error?.message || String(error) 
    }, { status: 500 });
  }
}


