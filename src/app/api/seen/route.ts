import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import SeenContent from '@/models/SeenContent';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const seenItems = await SeenContent.find({ userId: session.user.id }).sort({ seenAt: -1 });
    return NextResponse.json(seenItems || []);
  } catch (error) {
    console.error('Error fetching seen content:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, type } = await req.json();

    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }

    await dbConnect();

    // Check if already marked as seen
    const existing = await SeenContent.findOne({
      userId: session.user.id,
      title,
      type,
    });

    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const seenContent = await SeenContent.create({
      userId: session.user.id,
      title,
      type,
    });

    return NextResponse.json(seenContent, { status: 201 });
  } catch (error) {
    console.error('Error marking content as seen:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, type } = await req.json();

    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }

    await dbConnect();

    await SeenContent.deleteOne({
      userId: session.user.id,
      title,
      type,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error removing from seen content:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
