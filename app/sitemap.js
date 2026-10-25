import { getPublishedPosts } from '@/lib/posts';
import { SITE } from '@/lib/format';

export const revalidate = 300;

export default async function sitemap() {
  const posts = await getPublishedPosts();
  const base = ['', '/writing', '/research', '/about'].map((p) => ({ url: `${SITE.url}${p}`, lastModified: new Date() }));
  return [
    ...base,
    ...posts.map((p) => ({ url: `${SITE.url}/writing/${p.slug}`, lastModified: new Date(p.updated_at || p.published_at) })),
  ];
}
