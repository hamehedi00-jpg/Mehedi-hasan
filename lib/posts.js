import { serverClient } from './supabase';

const LIST_FIELDS =
  'slug,title,dek,category,kind,stats,pdf_url,cover_url,cover_label,published_at,updated_at,body';

export async function getPublishedPosts() {
  try {
    const { data, error } = await serverClient()
      .from('posts')
      .select(LIST_FIELDS)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('getPublishedPosts', e?.message || e);
    return [];
  }
}

export async function getPost(slug) {
  try {
    const { data, error } = await serverClient()
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('getPost', e?.message || e);
    return null;
  }
}

export async function getIndicators() {
  try {
    const { data, error } = await serverClient()
      .from('indicators')
      .select('id,label,value,detail,direction,sort,updated_at')
      .order('sort', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('getIndicators', e?.message || e);
    return [];
  }
}

export async function getSettings() {
  try {
    const { data, error } = await serverClient().from('settings').select('key,value');
    if (error) throw error;
    return Object.fromEntries((data || []).map((r) => [r.key, r.value]));
  } catch (e) {
    console.error('getSettings', e?.message || e);
    return {};
  }
}
