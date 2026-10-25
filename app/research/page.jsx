import { ReportCover } from '@/components/Lists';
import { getPublishedPosts } from '@/lib/posts';

export const revalidate = 60;

export const metadata = {
  title: 'Research',
  description: 'Full equity research reports on companies listed on the Dhaka Stock Exchange.',
  alternates: { canonical: '/research' },
};

export default async function ResearchPage() {
  const reports = (await getPublishedPosts()).filter((p) => p.kind === 'report');
  return (
    <div className="wrap">
      <header className="pagehead">
        <h1>Research</h1>
        <p>
          Full reports on companies listed on the Dhaka Stock Exchange. Each one sets out the valuation, the
          assumptions behind it, the case against it and what to watch.
        </p>
      </header>
      {reports.length ? (
        <div className="shelf">
          {reports.map((r) => (
            <ReportCover key={r.slug} post={r} />
          ))}
        </div>
      ) : (
        <p className="empty">The first report is being written.</p>
      )}
    </div>
  );
}
