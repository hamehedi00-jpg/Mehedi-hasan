import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase';

export async function POST(request) {
  let email = '';
  try {
    ({ email = '' } = await request.json());
  } catch {}
  email = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Enter a valid email address, like name@example.com.' }, { status: 400 });
  }
  const { error } = await serverClient().from('subscribers').insert({ email });
  if (error && error.code !== '23505') {
    console.error('subscribe', error.message);
    return NextResponse.json({ error: 'Subscription failed. Try again in a minute.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
