import Link from 'next/link';
import { SITE } from '@/lib/format';

export default function Footer({ settings = {} }) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="site-footer__grid">
          <div>
            <p className="site-footer__name">Mehedi Hasan</p>
            <p className="site-footer__note">
              A personal site. The views are my own and are not those of any employer. Nothing here is investment
              advice or a recommendation to buy, sell or hold any security.
            </p>
          </div>
          <div>
            <h3>Read</h3>
            <ul>
              <li>
                <Link href="/writing">All writing</Link>
              </li>
              <li>
                <Link href="/research">Research reports</Link>
              </li>
              <li>
                <a href="/feed.xml">RSS feed</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>Elsewhere</h3>
            <ul>
              {settings.facebook_url ? (
                <li>
                  <a href={settings.facebook_url} rel="me noopener">
                    WallStreet Radar BD on Facebook
                  </a>
                </li>
              ) : null}
              <li>
                <a href={settings.linkedin_url || SITE.linkedin} rel="me noopener">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.email || SITE.email}`}>Email</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="site-footer__base">
          <span>
            {year} {SITE.name}
          </span>
          <span>Written in Dhaka</span>
        </div>
      </div>
    </footer>
  );
}
