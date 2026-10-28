import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase';
import { SITE } from '@/lib/format';
import { addSubscriber, emailEnabled, sendEmail } from '@/lib/buttondown';

// Emails one published post to every subscriber. Called from the studio when
// the admin presses "Email subscribers". Only a signed in admin can use it, and
// a post can only be emailed once.
export async function POST(request) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Sign in again to send.' }, { status: 401 });

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
  if (adminError || !isAdmin) return NextResponse.json({ error: 'This account cannot send email.' }, { status: 403 });

  if (!emailEnabled()) {
    return NextResponse.json({ error: 'Email is not set up yet. Add BUTTONDOWN_API_KEY in Vercel.' }, { status: 503 });
  }

  let slug = '';
  try {
    ({ slug = '' } = await request.json());
  } catch {}
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('slug,title,dek,category,status,notified_at')
    .eq('slug', slug)
    .maybeSingle();
  if (postError || !post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
  if (post.status !== 'published') return NextResponse.json({ error: 'Publish the post first.' }, { status: 400 });
  if (post.notified_at) return NextResponse.json({ error: 'This post has already been emailed.' }, { status: 409 });

  // Make sure everyone saved on the site is on the Buttondown list too. Safe to
  // repeat: addresses that already exist are simply skipped.
  const { data: subscribers } = await supabase.from('subscribers').select('email').limit(1000);
  for (const s of subscribers || []) {
    await addSubscriber(s.email).catch(() => {});
  }

  const url = `${SITE.url}/writing/${post.slug}`;
  const body = [post.dek, `[Read the piece](${url})`].filter(Boolean).join('\n\n');
  const sent = await sendEmail({ subject: post.title, body });
  if (!sent.ok) {
    console.error('notify', sent.status, JSON.stringify(sent.data));
    return NextResponse.json({ error: 'Buttondown refused the email. Check the key and try again.' }, { status: 502 });
  }

  await supabase.from('posts').update({ notified_at: new Date().toISOString() }).eq('slug', post.slug);
  return NextResponse.json({ ok: true });
}
