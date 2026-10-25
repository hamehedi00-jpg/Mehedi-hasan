/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The share images read ET Book from disk, so ship the font with those routes.
  outputFileTracingIncludes: {
    '/opengraph-image': ['./app/fonts/**'],
    '/writing/[slug]/opengraph-image': ['./app/fonts/**'],
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'xnszbaryqnpdzcaujebj.supabase.co' }],
  },
  async headers() {
    return [
      {
        source: '/studio',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
