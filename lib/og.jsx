import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const OG_SIZE = { width: 1200, height: 630 };

async function loadGoogleFont(family, weight, text) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!src) return null;
    const res = await fetch(src[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

// ET Book is bundled with the site (app/fonts), so the cards match the pages.
async function loadEtBook() {
  try {
    const buf = await readFile(join(process.cwd(), 'app/fonts/et-book-roman-line-figures.woff'));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  } catch {
    return null;
  }
}

export async function renderCard({ kicker, title, footer }) {
  const text = `${kicker} ${title} ${footer} Mehedi Hasan`;
  const [serif, sans] = await Promise.all([
    loadEtBook(),
    loadGoogleFont('IBM+Plex+Sans', 500, text),
  ]);
  const fonts = [];
  if (serif) fonts.push({ name: 'ET Book', data: serif, weight: 400, style: 'normal' });
  if (sans) fonts.push({ name: 'Plex', data: sans, weight: 500, style: 'normal' });
  const size = title.length > 80 ? 60 : title.length > 50 ? 70 : 82;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#000',
          color: '#f3f3ee',
          padding: '64px 72px',
          position: 'relative',
          fontFamily: 'ET Book',
        }}
      >
        <div style={{ display: 'flex', fontFamily: 'Plex', fontSize: 26, color: '#3fbf8c', letterSpacing: 0.2 }}>
          {kicker}
        </div>
        <div style={{ display: 'flex', fontSize: size, lineHeight: 1.06, letterSpacing: -0.8, maxWidth: 1000 }}>{title}</div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'Plex',
            fontSize: 24,
            color: 'rgba(243,243,238,0.7)',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: 24,
          }}
        >
          <span style={{ color: '#f3f3ee' }}>Mehedi Hasan</span>
          <span>{footer}</span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined }
  );
}
