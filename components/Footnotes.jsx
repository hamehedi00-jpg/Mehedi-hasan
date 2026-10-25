'use client';

import { useEffect, useRef, useState } from 'react';

const WIDE = '(min-width: 1100px)';

// Footnotes written in Markdown ([^1]) become margin notes beside the line
// that cites them, in the manner of Tufte CSS. On narrower screens the note
// opens beside its marker on hover or focus instead, and the numbered list
// stays at the end of the piece.
export default function Footnotes() {
  const [note, setNote] = useState(null);
  const hideTimer = useRef(0);

  useEffect(() => {
    const refs = Array.from(document.querySelectorAll('[data-article] a[data-footnote-ref]'));
    if (!refs.length) return;

    const added = [];
    refs.forEach((a) => {
      const id = decodeURIComponent((a.getAttribute('href') || '').slice(1));
      const li = document.getElementById(id);
      if (!li) return;
      const clone = li.cloneNode(true);
      clone.querySelectorAll('[data-footnote-backref]').forEach((n) => n.remove());
      const side = document.createElement('span');
      side.className = 'sidenote';
      side.setAttribute('aria-hidden', 'true');
      const n = document.createElement('span');
      n.className = 'sidenote__n';
      n.textContent = a.textContent;
      side.appendChild(n);
      const body = document.createElement('span');
      body.innerHTML = clone.innerHTML;
      side.appendChild(body);
      (a.closest('sup') || a).after(side);
      added.push(side);
    });
    const section = document.querySelector('[data-article] .footnotes, [data-article] [data-footnotes]');
    if (section && added.length) section.setAttribute('data-has-sidenotes', 'true');

    const wide = window.matchMedia(WIDE);
    const show = (e) => {
      if (wide.matches) return;
      clearTimeout(hideTimer.current);
      const a = e.currentTarget;
      const id = decodeURIComponent((a.getAttribute('href') || '').slice(1));
      const li = document.getElementById(id);
      if (!li) return;
      const clone = li.cloneNode(true);
      clone.querySelectorAll('[data-footnote-backref]').forEach((x) => x.remove());
      const r = a.getBoundingClientRect();
      const width = Math.min(340, window.innerWidth - 32);
      const left = Math.max(16, Math.min(r.left + window.scrollX - width / 2, window.scrollX + window.innerWidth - width - 16));
      setNote({ html: clone.innerHTML, top: r.bottom + window.scrollY + 10, left, width });
    };
    const hide = () => {
      hideTimer.current = setTimeout(() => setNote(null), 160);
    };
    refs.forEach((a) => {
      a.addEventListener('mouseenter', show);
      a.addEventListener('focus', show);
      a.addEventListener('mouseleave', hide);
      a.addEventListener('blur', hide);
    });
    return () => {
      added.forEach((s) => s.remove());
      if (section) section.removeAttribute('data-has-sidenotes');
      refs.forEach((a) => {
        a.removeEventListener('mouseenter', show);
        a.removeEventListener('focus', show);
        a.removeEventListener('mouseleave', hide);
        a.removeEventListener('blur', hide);
      });
    };
  }, []);

  if (!note) return null;
  return (
    <div
      className="fn-pop"
      role="note"
      style={{ top: note.top, left: note.left, width: note.width }}
      onMouseEnter={() => clearTimeout(hideTimer.current)}
      onMouseLeave={() => setNote(null)}
      dangerouslySetInnerHTML={{ __html: note.html }}
    />
  );
}
