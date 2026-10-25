import { SITE } from '@/lib/format';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/studio', '/api/'] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
