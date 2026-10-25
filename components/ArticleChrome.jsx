'use client';

import { useEffect, useRef, useState } from 'react';

export function ReadingProgress() {
  const bar = useRef(null);
  useEffect(() => {
    const article = document.querySelector('[data-article]');
    const on = () => {
      if (!article || !bar.current) return;
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
      bar.current.style.transform = `scaleX(${p})`;
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, []);
  return (
    <div className="progress" aria-hidden="true">
      <span ref={bar} />
    </div>
  );
}

export function Toc({ items }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-90px 0px -65% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);
  if (items.length < 2) return null;
  return (
    <nav className="margin-block margin-block--toc toc" aria-label="On this page">
      <h2>In this piece</h2>
      <ol>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} data-active={active === i.id}>
              {i.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Share({ url, title }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  return (
    <div className="share">
      <span>Share</span>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`} target="_blank" rel="noopener noreferrer">
        LinkedIn
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer">
        Facebook
      </a>
      <a href={`https://x.com/intent/post?url=${enc(url)}&text=${enc(title)}`} target="_blank" rel="noopener noreferrer">
        X
      </a>
      <button type="button" onClick={copy} aria-live="polite">
        {copied ? 'Link copied' : 'Copy link'}
      </button>
    </div>
  );
}
