import CopyEmail from '@/components/CopyEmail';
import { getSettings } from '@/lib/posts';
import { SITE } from '@/lib/format';

export const revalidate = 300;

export const metadata = {
  title: 'About',
  description: 'Mehedi Hasan writes from Dhaka on markets, economic policy, politics and geopolitics.',
  alternates: { canonical: '/about' },
};

const INTERESTS = [
  'Valuation and the cost of capital in frontier markets',
  'Monetary policy, inflation and the exchange rate',
  'The political economy of Bangladesh',
  'Energy, trade and geopolitical risk',
];

export default async function AboutPage() {
  const settings = await getSettings();
  const email = settings.email || SITE.email;

  return (
    <div className="wrap">
      <section className="about">
        <div>
          <h1>About</h1>
          <div className="prose about__prose">
            <p className="about__lead">
              I am Mehedi Hasan, a finance graduate based in Dhaka. I write about how markets price risk in a frontier
              economy, and about the policy and political choices that shape those prices.
            </p>
            <p>
              Much of what moves the Dhaka Stock Exchange begins elsewhere: in a central bank's reading of inflation, a
              decision on fuel prices, the income of workers in the Gulf, or an election on another continent. I am
              interested in tracing those connections with care, and in separating what the evidence shows from what
              the prevailing story assumes.
            </p>
            <p>
              This site is where I work through those questions in public. Some pieces are long analyses of a single
              company or policy; others are short notes on a data release or a decision. Each sets out its sources and
              its assumptions, so that the argument can be tested rather than taken on trust.
            </p>
            <h2>Method</h2>
            <p>
              I rely on primary sources where they exist, state the assumptions behind any estimate, and say what would
              change my view. Corrections are added with a date, never made silently.
            </p>
          </div>
        </div>

        <aside className="about__side">
          {settings.portrait_url ? (
            <figure className="portrait">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={settings.portrait_url} alt="Mehedi Hasan" />
            </figure>
          ) : null}
          <dl className="facts">
            <dt>Interests</dt>
            <dd>
              <ul className="facts__list">
                {INTERESTS.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </dd>
            <dt>Based in</dt>
            <dd>Dhaka, Bangladesh</dd>
            <dt>Contact</dt>
            <dd>
              <CopyEmail email={email} />
              <span style={{ display: 'block', marginTop: 6 }}>
                <a className="textlink" href={settings.linkedin_url || SITE.linkedin} rel="me noopener">
                  LinkedIn
                </a>
              </span>
            </dd>
          </dl>
          <p className="about__note">
            The views expressed here are my own and do not represent any employer. Nothing on this site is investment
            advice.
          </p>
        </aside>
      </section>
    </div>
  );
}
