import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createSupabase } from '@/lib/supabase';


export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const supabase = createSupabase();


    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error(' Failed to parse request JSON:', e);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields: email and password are required' }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
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

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        email: normalizedEmail,
        password: hashedPassword,
      });

    if (insertError) {
      console.error(' Supabase insertion error:', insertError);
      return NextResponse.json({ error: 'Database insertion failed', details: insertError }, { status: 500 });
    }

    console.log(`✓ New user registered: ${normalizedEmail}`);

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error(' CRITICAL error in registration handler:', error);
    return NextResponse.json({ 
      error: 'Unexpected Server Error', 
      message: error?.message || String(error),
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}



