import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Recommendation from '@/models/Recommendation';

export const runtime = 'nodejs';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const saved = await Recommendation.find({ userId: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json(saved);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();
    await dbConnect();
    
    // Check if already saved
    const existing = await Recommendation.findOne({ 
      userId: session.user.id,
      title: data.title,
      type: data.type
    });

    if (existing) {
      return NextResponse.json({ message: 'Already saved' }, { status: 200 });
    }

    const saved = await Recommendation.create({
      ...data,
      userId: session.user.id,
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await req.json();
    await dbConnect();
    await Recommendation.deleteOne({ _id: id, userId: session.user.id });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
