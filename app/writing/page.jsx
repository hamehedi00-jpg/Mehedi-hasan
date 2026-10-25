import Link from 'next/link';
import { PostIndex } from '@/components/Lists';
import { getPublishedPosts } from '@/lib/posts';
import { CATEGORIES } from '@/lib/format';

export const revalidate = 60;

export const metadata = {
  title: 'Writing',
  description: 'Every essay, note and research report, newest first.',
  alternates: { canonical: '/writing' },
};

export default async function WritingPage({ searchParams }) {
  const params = (await searchParams) || {};
  const topic = typeof params.topic === 'string' ? params.topic.toLowerCase() : '';
  const all = await getPublishedPosts();
  const posts = topic
    ? all.filter((p) => (topic === 'research' ? p.kind === 'report' : p.category.toLowerCase() === topic))
    : all;

  const byYear = posts.reduce((acc, p) => {
    const y = new Date(p.published_at).getFullYear();
    (acc[y] ||= []).push(p);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => b - a);

  return (
    <div className="wrap">
      <header className="pagehead">
        <h1>Writing</h1>
        <p>Essays, short notes and research reports on markets, policy, politics and geopolitics, newest first.</p>
      </header>
      <nav className="filters" aria-label="Filter by topic">
        <Link href="/writing" aria-current={!topic ? 'true' : undefined}>
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c} href={`/writing?topic=${c.toLowerCase()}`} aria-current={topic === c.toLowerCase() ? 'true' : undefined}>
            {c}
          </Link>
        ))}
        <Link href="/writing?topic=research" aria-current={topic === 'research' ? 'true' : undefined}>
          Research reports
        </Link>
      </nav>
      {years.length ? (
        years.map((y) => (
          <section key={y} aria-label={y}>
            <h2 className="year">{y}</h2>
            <PostIndex posts={byYear[y]} />
          </section>
        ))
      ) : (
        <p className="empty">Nothing published on this subject yet.</p>
      )}
    </div>
  );
}
