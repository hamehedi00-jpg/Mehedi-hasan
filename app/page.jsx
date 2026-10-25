import Link from 'next/link';
import Subscribe from '@/components/Subscribe';
import { PostIndex } from '@/components/Lists';
import { getIndicators, getPublishedPosts, getSettings } from '@/lib/posts';
import { CATEGORIES, categoryHref } from '@/lib/format';

const TOPICS = {
  Markets: 'Valuation, earnings and the price of risk on the Dhaka Stock Exchange.',
  Policy: 'Monetary policy, the exchange rate, energy pricing and the budget.',
  Politics: 'Institutions, elections and the political economy of reform.',
  Geopolitics: 'War, trade and alliances, and how they reach Bangladesh.',
};

export const revalidate = 60;

function Direction({ dir }) {
  if (dir !== 'up' && dir !== 'down') return null;
  return (
    <span className="dir" data-dir={dir} aria-label={dir === 'up' ? 'rising' : 'falling'}>
      {dir === 'up' ? '▲' : '▼'}
    </span>
  );
}

export default async function Home() {
  const [posts, indicators, settings] = await Promise.all([getPublishedPosts(), getIndicators(), getSettings()]);
  const lead = posts[0];
  const asOf = settings.indicators_as_of;

  return (
    <div className="wrap">
      <section className="opening" aria-labelledby="opening-title">
        <div>
          <h1 id="opening-title">Markets, policy and geopolitics, examined from Dhaka.</h1>
          <p className="opening__lede">
            Essays and notes by Mehedi Hasan on how a frontier economy prices risk, and on the decisions in Dhaka and
            abroad that change that price.
          </p>
          <div className="opening__actions">
            {lead ? (
              <Link className="btn" href={`/writing/${lead.slug}`}>
                Read the latest
              </Link>
            ) : null}
            <a className="textlink" href="#subscribe">
              Get new writing by email
            </a>
          </div>
        </div>

        {indicators.length ? (
          <aside className="ledger" aria-labelledby="ledger-title">
            <div className="ledger__head">
              <h2 id="ledger-title">The numbers I am watching</h2>
              {asOf ? <p>{asOf.replace(/^Updated\s+/i, '')}</p> : null}
            </div>
            <ul className="ledger__rows">
              {indicators.map((f) => (
                <li className="ledger__row" key={f.id}>
                  <span>
                    <span className="ledger__label">{f.label}</span>
                    {f.detail ? <span className="ledger__detail">{f.detail}</span> : null}
                  </span>
                  <span className="ledger__value">
                    {f.value}
                    <Direction dir={f.direction} />
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </section>

      {posts.length ? (
        <section className="section" aria-labelledby="latest">
          <div className="head">
            <h2 id="latest">Latest writing</h2>
            <Link href="/writing">All writing</Link>
          </div>
          <PostIndex posts={posts.slice(0, 7)} leadFirst />
        </section>
      ) : null}

      <section className="section" aria-labelledby="subjects">
        <div className="head">
          <h2 id="subjects">What I write about</h2>
        </div>
        <div className="subjects">
          {CATEGORIES.map((c) => (
            <Link key={c} href={categoryHref(c)} className="subject">
              <span className="subject__name">{c}</span>
              <span className="subject__desc">{TOPICS[c]}</span>
            </Link>
          ))}
        </div>
      </section>

      <Subscribe />
    </div>
  );
}
