export const SITE = {
  name: 'Mehedi Hasan',
  author: 'Mehedi Hasan',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://mehedi-hasan.vercel.app',
  description:
    'Essays and notes by Mehedi Hasan on markets, economic policy, politics and geopolitics, written from Dhaka.',
  linkedin: 'https://www.linkedin.com/in/mehedihasan007',
  email: 'hamehedi32@gmail.com',
};

export const CATEGORIES = ['Markets', 'Policy', 'Politics', 'Geopolitics'];

export function formatDate(value, opts = {}) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: opts.short ? 'short' : 'long',
    year: 'numeric',
    timeZone: 'Asia/Dhaka',
  });
}

export function readingMinutes(body = '') {
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_|`\-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export function slugify(text = '') {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

export function categoryHref(category) {
  return `/writing?topic=${encodeURIComponent(category.toLowerCase())}`;
}
