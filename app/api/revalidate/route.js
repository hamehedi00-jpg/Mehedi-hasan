import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase';

// Called by the studio after a save so the change shows on the site at once.
// Only a signed in admin can trigger it.
export async function POST(request) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Sign in again to publish.' }, { status: 401 });
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: isAdmin, error } = await supabase.rpc('is_admin');
  if (error || !isAdmin) return NextResponse.json({ error: 'This account cannot publish.' }, { status: 403 });

  let slug = '';
  try {
    ({ slug = '' } = await request.json());
  } catch {}
  revalidatePath('/', 'layout');
  if (slug) revalidatePath(`/writing/${slug}`);
  return NextResponse.json({ ok: true });
}
