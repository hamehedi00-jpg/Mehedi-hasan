'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from './Logo';

const NAV = [
  { href: '/writing', label: 'Writing' },
  { href: '/research', label: 'Research' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  const pathname = usePathname() || '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  if (pathname.startsWith('/studio')) return null;

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="wrap site-header__inner">
        <Link href="/" className="brand" aria-label="Mehedi Hasan, home">
          <Logo />
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={pathname.startsWith(n.href) ? 'page' : undefined}>
              {n.label}
            </Link>
          ))}
          <a className="nav__sub" href="/#subscribe">
            Subscribe
          </a>
        </nav>
      </div>
    </header>
  );
}
