import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { IBM_Plex_Sans, Noto_Serif_Bengali } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSettings } from '@/lib/posts';
import { SITE } from '@/lib/format';
import './globals.css';

// ET Book, the typeface cut for Edward Tufte's books. MIT licence, from
// github.com/edwardtufte/et-book. See app/fonts/ET-BOOK-LICENSE.txt.
const etbook = localFont({
  src: [
    { path: './fonts/et-book-roman-line-figures.woff', weight: '400', style: 'normal' },
    { path: './fonts/et-book-display-italic-old-style-figures.woff', weight: '400', style: 'italic' },
    { path: './fonts/et-book-bold-line-figures.woff', weight: '700', style: 'normal' },
  ],
  variable: '--font-etbook',
  display: 'swap',
  fallback: ['Palatino', 'Palatino Linotype', 'Book Antiqua', 'Georgia', 'serif'],
});

const plex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex',
  display: 'swap',
});

const bangla = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['400', '600'],
  variable: '--font-bangla',
  display: 'swap',
  preload: false,
});

export const revalidate = 300;

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name}: markets, policy and geopolitics from Dhaka`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  authors: [{ name: SITE.author }],
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': [{ url: '/feed.xml', title: SITE.name }] },
  },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'en_GB',
    title: `${SITE.name}: markets, policy and geopolitics from Dhaka`,
    description: SITE.description,
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfcf9' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default async function RootLayout({ children }) {
  const settings = await getSettings();
  return (
    <html lang="en" className={`${etbook.variable} ${plex.variable} ${bangla.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer settings={settings} />
                <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
