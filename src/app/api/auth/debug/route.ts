import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createSupabase } from '@/lib/supabase';



export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = createSupabase();
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(' Supabase debug GET error:', error);
      return NextResponse.json({ error: 'Debug query failed', details: error }, { status: 500 });
    }

    return NextResponse.json({ userCount: count });
  } catch (error: any) {
    console.error(' CRITICAL error in debug GET:', error);
    return NextResponse.json(
      { error: 'Unexpected Server Error', message: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createSupabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();
    
    if (checkError) {
      console.error(' Supabase check error:', checkError);
      return NextResponse.json({ error: 'Database check failed', details: checkError }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: normalizedEmail,
        password: hashedPassword,
      })
      .select()
      .single();

    if (insertError) {
      console.error(' Supabase insertion error:', insertError);
      return NextResponse.json({ error: 'Database insertion failed', details: insertError }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Test user created',
      email: newUser.email,
      userId: newUser.id.toString(),
    });
  } catch (error: any) {
    console.error(' CRITICAL error in debug POST:', error);
    return NextResponse.json(
      { error: 'Unexpected Server Error', message: error?.message || String(error) },
      { status: 500 }
    );
  }
}


