'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Markdown from '@/components/Markdown';
import { browserSupabase } from '@/lib/supabase';
import { CATEGORIES, formatDate, slugify } from '@/lib/format';

const EMPTY = {
  id: null,
  title: '',
  slug: '',
  dek: '',
  category: 'Markets',
  kind: 'essay',
  status: 'draft',
  published_at: new Date().toISOString(),
  body: '',
  stats: [],
  pdf_url: '',
  pdf_note: '',
  cover_label: '',
  lang: 'en',
};

const CHART_TEMPLATE = `\n\n\`\`\`chart
{
  "type": "bar",
  "title": "State the finding here, with its number",
  "subtitle": "Unit and period",
  "unit": "%",
  "highlight": "A",
  "data": [
    { "label": "A", "value": 17.4 },
    { "label": "B", "value": 12.6 },
    { "label": "C", "value": 9.4 }
  ],
  "source": "Source: name the filing or dataset"
}
\`\`\`\n\n`;

async function revalidate(supabase, slug) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return;
  await fetch('/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ slug }),
  }).catch(() => {});
}

async function uploadFile(supabase, file, folder) {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const path = `${folder}/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, '')) || 'file'}.${ext}`;
  const { error } = await supabase.storage.from('media').upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
    cacheControl: '31536000',
  });
  if (error) throw error;
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}

export default function Studio() {
  const supabase = useMemo(() => browserSupabase(), []);
  const [session, setSession] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('posts');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!session) {
      setAdmin(null);
      return;
    }
    supabase.rpc('is_admin').then(({ data }) => setAdmin(!!data));
  }, [session, supabase]);

  if (!ready) return <div className="wrap studio">Loading the studio</div>;
  if (!session) return <Login supabase={supabase} />;

  return (
    <div className="wrap studio">
      <div className="studio__bar">
        <div>
          <h1>Studio</h1>
          <p className="help">Signed in as {session.user.email}</p>
        </div>
        <span className="spacer" />
        <Link className="btn btn--ghost btn--small" href="/" target="_blank">
          View site
        </Link>
        <button className="btn btn--ghost btn--small" type="button" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>
      {admin === false ? (
        <p className="form-note" data-tone="bad">
          This account is not set up to publish. Ask for your email to be added as an admin.
        </p>
      ) : (
        <>
          <div className="studio__tabs" role="tablist">
            {[
              ['posts', 'Posts'],
              ['numbers', 'Numbers I am watching'],
              ['profile', 'Profile'],
            ].map(([k, label]) => (
              <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => setTab(k)}>
                {label}
              </button>
            ))}
          </div>
          {tab === 'posts' ? <Posts supabase={supabase} /> : null}
          {tab === 'numbers' ? <Numbers supabase={supabase} /> : null}
          {tab === 'profile' ? <Profile supabase={supabase} /> : null}
        </>
      )}
    </div>
  );
}

function Login({ supabase }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNote('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setNote('Email or password is wrong. Check both and try again.');
    setBusy(false);
  };
  return (
    <div className="wrap studio">
      <h1>Studio</h1>
      <p className="help">Sign in to write and publish.</p>
      <form className="studio__login" onSubmit={submit}>
        <label>
          Email
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Signing in' : 'Sign in'}
        </button>
        <p className="form-note" data-tone="bad">
          {note}
        </p>
      </form>
    </div>
  );
}

function Posts({ supabase }) {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('id,slug,title,status,category,kind,published_at,updated_at')
      .order('published_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const open = async (id) => {
    const { data } = await supabase.from('posts').select('*').eq('id', id).single();
    if (data) setEditing({ ...EMPTY, ...data, stats: data.stats || [] });
  };

  if (editing) {
    return (
      <Editor
        supabase={supabase}
        initial={editing}
        onClose={() => {
          setEditing(null);
          load();
        }}
      />
    );
  }

  return (
    <>
      <div className="studio__bar">
        <button className="btn btn--small" type="button" onClick={() => setEditing({ ...EMPTY, published_at: new Date().toISOString() })}>
          New post
        </button>
        <span className="help">Drafts stay private. A post appears on the site when its status is Published.</span>
      </div>
      {loading ? (
        <p className="help">Loading posts</p>
      ) : posts.length ? (
        <ul className="studio__list">
          {posts.map((p) => (
            <li key={p.id}>
              <button className="link" type="button" onClick={() => open(p.id)}>
                {p.title || 'Untitled'}
              </button>
              <span className="pill" data-status={p.status}>
                {p.status === 'published' ? 'Published' : 'Draft'}
              </span>
              <span className="help">
                {p.kind === 'report' ? 'Report' : p.category}, {formatDate(p.published_at, { short: true })}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="help">No posts yet. Start one with New post.</p>
      )}
    </>
  );
}

function Editor({ supabase, initial, onClose }) {
  const [post, setPost] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.id);
  const [preview, setPreview] = useState(false);
  const [note, setNote] = useState({ tone: '', text: '' });
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef(null);
  const imgInput = useRef(null);
  const pdfInput = useRef(null);

  const set = (k, v) => setPost((p) => ({ ...p, [k]: v }));
  const setTitle = (v) => setPost((p) => ({ ...p, title: v, slug: slugTouched ? p.slug : slugify(v) }));

  const insertAtCursor = (text) => {
    const el = bodyRef.current;
    if (!el) return set('body', post.body + text);
    const start = el.selectionStart ?? post.body.length;
    const end = el.selectionEnd ?? start;
    const next = post.body.slice(0, start) + text + post.body.slice(end);
    set('body', next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + text.length;
    });
  };

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setNote({ tone: '', text: 'Uploading image' });
    try {
      const url = await uploadFile(supabase, file, 'images');
      insertAtCursor(`\n\n![Describe the image](${url})\n\n`);
      setNote({ tone: 'good', text: 'Image added. Replace "Describe the image" with a short description.' });
    } catch (err) {
      setNote({ tone: 'bad', text: `Upload failed: ${err.message}` });
    }
  };

  const onPdf = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setNote({ tone: '', text: 'Uploading PDF' });
    try {
      const url = await uploadFile(supabase, file, 'pdfs');
      set('pdf_url', url);
      setNote({ tone: 'good', text: 'PDF attached. Save the post to keep it.' });
    } catch (err) {
      setNote({ tone: 'bad', text: `Upload failed: ${err.message}` });
    }
  };

  const save = async (status) => {
    if (!post.title.trim() || !post.slug.trim()) {
      setNote({ tone: 'bad', text: 'Add a title before saving.' });
      return;
    }
    setBusy(true);
    setNote({ tone: '', text: 'Saving' });
    const row = {
      title: post.title.trim(),
      slug: slugify(post.slug),
      dek: post.dek?.trim() || null,
      category: post.category,
      kind: post.kind,
      status: status || post.status,
      published_at: post.published_at,
      body: post.body,
      stats: (post.stats || []).filter((s) => s.label || s.value),
      pdf_url: post.pdf_url || null,
      pdf_note: post.pdf_note || null,
      cover_label: post.cover_label || null,
      lang: post.lang || 'en',
      updated_at: new Date().toISOString(),
    };
    const query = post.id
      ? supabase.from('posts').update(row).eq('id', post.id).select().single()
      : supabase.from('posts').insert(row).select().single();
    const { data, error } = await query;
    setBusy(false);
    if (error) {
      setNote({
        tone: 'bad',
        text: error.code === '23505' ? 'Another post already uses this web address. Change the slug.' : `Save failed: ${error.message}`,
      });
      return;
    }
    setPost((p) => ({ ...p, ...data, stats: data.stats || [] }));
    await revalidate(supabase, data.slug);
    setNote({
      tone: 'good',
      text: data.status === 'published' ? 'Published. The site is updated.' : 'Draft saved. It is not visible on the site.',
    });
  };

  const emailSubscribers = async () => {
    if (!window.confirm(`Email "${post.title}" to all subscribers now? This cannot be undone.`)) return;
    setBusy(true);
    setNote({ tone: '', text: 'Sending' });
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ slug: post.slug }),
    }).catch(() => null);
    const body = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res || !res.ok) {
      return setNote({ tone: 'bad', text: body.error || 'Could not send. Try again in a minute.' });
    }
    setPost((p) => ({ ...p, notified_at: new Date().toISOString() }));
    setNote({ tone: 'good', text: 'Sent. Subscribers will get the email within a few minutes.' });
  };

  const remove = async () => {
    if (!post.id) return onClose();
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) return setNote({ tone: 'bad', text: `Delete failed: ${error.message}` });
    await revalidate(supabase, post.slug);
    onClose();
  };

  const dateValue = (post.published_at || '').slice(0, 10);

  return (
    <div>
      <div className="studio__bar">
        <button className="btn btn--ghost btn--small" type="button" onClick={onClose}>
          Back to posts
        </button>
        <span className="spacer" />
        {post.status === 'published' && post.id ? (
          <Link className="btn btn--ghost btn--small" href={`/writing/${post.slug}`} target="_blank">
            View post
          </Link>
        ) : null}
        {post.status === 'published' && post.id ? (
          <button
            className="btn btn--ghost btn--small"
            type="button"
            disabled={busy || Boolean(post.notified_at)}
            onClick={emailSubscribers}
            title={post.notified_at ? 'This post has already been emailed' : 'Send this post to all subscribers'}
          >
            {post.notified_at ? 'Emailed' : 'Email subscribers'}
          </button>
        ) : null}
        <button className="btn btn--ghost btn--small" type="button" disabled={busy} onClick={() => save('draft')}>
          {post.status === 'published' ? 'Unpublish' : 'Save draft'}
        </button>
        <button className="btn btn--small" type="button" disabled={busy} onClick={() => save('published')}>
          {post.status === 'published' ? 'Update' : 'Publish'}
        </button>
      </div>
      <p className="form-note" data-tone={note.tone} role="status">
        {note.text}
      </p>

      <div className="studio__grid">
        <label className="span4">
          Title
          <input value={post.title} onChange={(e) => setTitle(e.target.value)} placeholder="A headline that states the argument" />
        </label>
        <label className="span4">
          Summary, shown under the headline and in link previews
          <input value={post.dek || ''} onChange={(e) => set('dek', e.target.value)} placeholder="One sentence" />
        </label>
        <label className="span2">
          Web address
          <input
            value={post.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set('slug', e.target.value);
            }}
          />
        </label>
        <label>
          Topic
          <select value={post.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select value={post.kind} onChange={(e) => set('kind', e.target.value)}>
            <option value="essay">Essay</option>
            <option value="note">Short note</option>
            <option value="report">Research report</option>
          </select>
        </label>
        <label>
          Publish date
          <input
            type="date"
            value={dateValue}
            onChange={(e) => e.target.value && set('published_at', new Date(`${e.target.value}T09:00:00+06:00`).toISOString())}
          />
        </label>
        <label>
          Language
          <select value={post.lang || 'en'} onChange={(e) => set('lang', e.target.value)}>
            <option value="en">English</option>
            <option value="bn">Bangla</option>
          </select>
        </label>
        {post.kind === 'report' ? (
          <label className="span2">
            Cover label, for example DSE: SQURPHARMA
            <input value={post.cover_label || ''} onChange={(e) => set('cover_label', e.target.value)} />
          </label>
        ) : null}
      </div>

      <h3 style={{ margin: '28px 0 8px', fontWeight: 600 }}>Key numbers</h3>
      <p className="help" style={{ margin: '0 0 10px' }}>
        Optional. Shown under Key figures in the margin of the post and on report covers. The first one is also the
        headline number beside the piece on the home page and in Writing, so put the most telling figure first. Keep to
        three to five.
      </p>
      <table className="studio__table">
        <tbody>
          {(post.stats || []).map((s, i) => (
            <tr key={i}>
              <td>
                <input
                  placeholder="Value, for example 8.0x"
                  value={s.value}
                  onChange={(e) => set('stats', post.stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                />
              </td>
              <td>
                <input
                  placeholder="Label, for example P/E, FY2025"
                  value={s.label}
                  onChange={(e) => set('stats', post.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                />
              </td>
              <td style={{ width: 90 }}>
                <button className="btn btn--ghost btn--small" type="button" onClick={() => set('stats', post.stats.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="studio__bar">
        <button className="btn btn--ghost btn--small" type="button" onClick={() => set('stats', [...(post.stats || []), { value: '', label: '' }])}>
          Add a number
        </button>
        <span className="spacer" />
        <input ref={pdfInput} type="file" accept="application/pdf" hidden onChange={onPdf} />
        {post.pdf_url ? (
          <>
            <a className="help" href={post.pdf_url} target="_blank" rel="noopener">
              PDF attached
            </a>
            <button className="btn btn--ghost btn--small" type="button" onClick={() => set('pdf_url', '')}>
              Remove PDF
            </button>
          </>
        ) : null}
        <button className="btn btn--ghost btn--small" type="button" onClick={() => pdfInput.current?.click()}>
          {post.pdf_url ? 'Replace PDF' : 'Attach a PDF'}
        </button>
      </div>

      <div className="studio__bar">
        <strong style={{ fontWeight: 600 }}>Body</strong>
        <span className="help">Markdown: ## for a heading, **bold**, [text](link), - for a list, [^1] for a footnote.</span>
        <span className="spacer" />
        <input ref={imgInput} type="file" accept="image/*" hidden onChange={onImage} />
        <button className="btn btn--ghost btn--small" type="button" onClick={() => imgInput.current?.click()}>
          Insert image
        </button>
        <button className="btn btn--ghost btn--small" type="button" onClick={() => insertAtCursor(CHART_TEMPLATE)}>
          Insert chart
        </button>
        <button className="btn btn--ghost btn--small" type="button" onClick={() => setPreview((v) => !v)}>
          {preview ? 'Hide preview' : 'Show preview'}
        </button>
      </div>
      <div className={preview ? 'split' : ''}>
        <textarea
          ref={bodyRef}
          value={post.body}
          onChange={(e) => set('body', e.target.value)}
          placeholder="Start writing"
          spellCheck
        />
        {preview ? (
          <div className="preview prose" lang={post.lang || 'en'}>
            <Markdown>{post.body}</Markdown>
          </div>
        ) : null}
      </div>

      <div className="studio__bar" style={{ marginTop: 28 }}>
        <button className="btn btn--ghost btn--small btn--danger" type="button" onClick={remove}>
          {post.id ? 'Delete post' : 'Discard'}
        </button>
      </div>
    </div>
  );
}

function Numbers({ supabase }) {
  const [rows, setRows] = useState([]);
  const [asOf, setAsOf] = useState('');
  const [note, setNote] = useState({ tone: '', text: '' });

  useEffect(() => {
    supabase
      .from('indicators')
      .select('*')
      .order('sort')
      .then(({ data }) => setRows(data || []));
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'indicators_as_of')
      .maybeSingle()
      .then(({ data }) => setAsOf(data?.value || ''));
  }, [supabase]);

  const update = (i, k, v) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const save = async () => {
    setNote({ tone: '', text: 'Saving' });
    const clean = rows.map((r, i) => ({
      ...(r.id ? { id: r.id } : {}),
      label: r.label || '',
      value: r.value || '',
      detail: r.detail || null,
      direction: r.direction || null,
      sort: i,
    }));
    const { data: existing } = await supabase.from('indicators').select('id');
    const keep = new Set(clean.filter((r) => r.id).map((r) => r.id));
    const gone = (existing || []).map((r) => r.id).filter((id) => !keep.has(id));
    if (gone.length) await supabase.from('indicators').delete().in('id', gone);
    const withId = clean.filter((r) => r.id);
    const without = clean.filter((r) => !r.id);
    const r1 = withId.length ? await supabase.from('indicators').upsert(withId) : { error: null };
    const r2 = without.length ? await supabase.from('indicators').insert(without) : { error: null };
    const r3 = await supabase.from('settings').upsert([
      { key: 'indicators_as_of', value: asOf },
      // The home page hides the table if this date is more than two weeks old.
      { key: 'indicators_updated_at', value: new Date().toISOString() },
    ]);
    const err = r1.error || r2.error || r3.error;
    if (err) return setNote({ tone: 'bad', text: `Save failed: ${err.message}` });
    const { data } = await supabase.from('indicators').select('*').order('sort');
    setRows(data || []);
    await revalidate(supabase, '');
    setNote({ tone: 'good', text: 'Saved. The home page is updated.' });
  };

  return (
    <div>
      <p className="help">These figures appear on the home page under The numbers I am watching.</p>
      <label style={{ maxWidth: 420, marginBottom: 16 }}>
        Note shown beside the heading
        <input value={asOf} onChange={(e) => setAsOf(e.target.value)} placeholder="As of 23 October 2026" />
      </label>
      <table className="studio__table">
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || `n${i}`}>
              <td>
                <input placeholder="Value" value={r.value || ''} onChange={(e) => update(i, 'value', e.target.value)} />
              </td>
              <td>
                <input placeholder="Label" value={r.label || ''} onChange={(e) => update(i, 'label', e.target.value)} />
              </td>
              <td>
                <input placeholder="Detail, for example Close, 19 October" value={r.detail || ''} onChange={(e) => update(i, 'detail', e.target.value)} />
              </td>
              <td style={{ width: 120 }}>
                <select value={r.direction || ''} onChange={(e) => update(i, 'direction', e.target.value)}>
                  <option value="">No arrow</option>
                  <option value="up">Rising</option>
                  <option value="down">Falling</option>
                </select>
              </td>
              <td style={{ width: 90 }}>
                <button className="btn btn--ghost btn--small" type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="studio__bar">
        <button className="btn btn--ghost btn--small" type="button" onClick={() => setRows([...rows, { label: '', value: '', detail: '' }])}>
          Add a number
        </button>
        <button className="btn btn--small" type="button" onClick={save}>
          Save numbers
        </button>
      </div>
      <p className="form-note" data-tone={note.tone}>
        {note.text}
      </p>
    </div>
  );
}

function Profile({ supabase }) {
  const [settings, setSettings] = useState({});
  const [note, setNote] = useState({ tone: '', text: '' });
  const [password, setPassword] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    supabase
      .from('settings')
      .select('key,value')
      .then(({ data }) => setSettings(Object.fromEntries((data || []).map((r) => [r.key, r.value]))));
  }, [supabase]);

  const saveKeys = async (patch) => {
    const rows = Object.entries(patch).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from('settings').upsert(rows);
    if (error) throw error;
    setSettings((s) => ({ ...s, ...patch }));
    await revalidate(supabase, '');
  };

  const onPortrait = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setNote({ tone: '', text: 'Uploading photo' });
    try {
      const url = await uploadFile(supabase, file, 'portrait');
      await saveKeys({ portrait_url: url });
      setNote({ tone: 'good', text: 'Photo updated across the site.' });
    } catch (err) {
      setNote({ tone: 'bad', text: `Upload failed: ${err.message}` });
    }
  };

  const saveLinks = async () => {
    try {
      await saveKeys({
        email: settings.email || '',
        linkedin_url: settings.linkedin_url || '',
        facebook_url: settings.facebook_url || '',
      });
      setNote({ tone: 'good', text: 'Links saved.' });
    } catch (err) {
      setNote({ tone: 'bad', text: `Save failed: ${err.message}` });
    }
  };

  const changePassword = async () => {
    if (password.length < 10) return setNote({ tone: 'bad', text: 'Use at least 10 characters.' });
    const { error } = await supabase.auth.updateUser({ password });
    setPassword('');
    setNote(error ? { tone: 'bad', text: `Password not changed: ${error.message}` } : { tone: 'good', text: 'Password changed.' });
  };

  return (
    <div style={{ display: 'grid', gap: 36, maxWidth: 640 }}>
      <section>
        <h3 style={{ margin: '0 0 12px', fontWeight: 600 }}>Photo</h3>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          {settings.portrait_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.portrait_url} alt="" width="88" height="110" style={{ objectFit: 'cover', borderRadius: 6 }} />
          ) : (
            <span className="help">No photo yet</span>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPortrait} />
          <button className="btn btn--ghost btn--small" type="button" onClick={() => fileRef.current?.click()}>
            {settings.portrait_url ? 'Replace photo' : 'Upload photo'}
          </button>
        </div>
        <p className="help">Used on the About page, beside the headline on the home page and in every byline.</p>
      </section>
      <section style={{ display: 'grid', gap: 12 }}>
        <h3 style={{ margin: 0, fontWeight: 600 }}>Links</h3>
        <label>
          Email shown on the site
          <input value={settings.email || ''} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
        </label>
        <label>
          LinkedIn address
          <input value={settings.linkedin_url || ''} onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })} />
        </label>
        <label>
          WallStreet Radar BD Facebook page address
          <input value={settings.facebook_url || ''} onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })} />
        </label>
        <div>
          <button className="btn btn--small" type="button" onClick={saveLinks}>
            Save links
          </button>
        </div>
      </section>
      <section style={{ display: 'grid', gap: 12 }}>
        <h3 style={{ margin: 0, fontWeight: 600 }}>Password</h3>
        <label>
          New password
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <div>
          <button className="btn btn--ghost btn--small" type="button" onClick={changePassword}>
            Change password
          </button>
        </div>
      </section>
      <p className="form-note" data-tone={note.tone}>
        {note.text}
      </p>
    </div>
  );
}
