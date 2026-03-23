import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Favorite from '@/models/Favorite';

export const runtime = 'nodejs';

const PAGE_SIZE = 12;

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = Math.max(0, parseInt(searchParams.get('page') ?? '0', 10));

    await dbConnect();
    const [items, total] = await Promise.all([
      Favorite.find({ userId: session.user.id })
        .sort({ _id: -1 })
        .skip(page * PAGE_SIZE)
        .limit(PAGE_SIZE),
      Favorite.countDocuments({ userId: session.user.id }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    console.error('Full error in GET favorites:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();
    await dbConnect();
    
    const favorite = await Favorite.create({
      ...data,
      userId: session.user.id,
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error('Full error in POST favorites:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
