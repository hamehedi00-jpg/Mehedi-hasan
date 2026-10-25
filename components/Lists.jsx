import Link from 'next/link';
import { formatDate, readingMinutes } from '@/lib/format';

const KIND = { essay: 'Essay', note: 'Note', report: 'Research report' };

export function kindLabel(kind) {
  return KIND[kind] || 'Note';
}

// Key figures in an article's margin. The first stat of a post is also its
// headline number in every list.
export function Stats({ stats = [] }) {
  if (!stats.length) return null;
  return (
    <dl className="keyfigs">
      {stats.map((s, i) => (
        <div className="keyfig" key={i}>
          <dt>{s.label}</dt>
          <dd>{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Entry({ post, lead = false }) {
  const fig = post.stats?.[0];
  const minutes = post.body ? readingMinutes(post.body) : null;
  return (
    <li className={lead ? 'entry entry--lead' : 'entry'}>
      <Link className="entry__link" href={`/writing/${post.slug}`}>
        <span className="entry__meta">
          <time dateTime={post.published_at}>{formatDate(post.published_at, { short: true })}</time>
          <span className="entry__topic">{post.category}</span>
          <span>
            {kindLabel(post.kind)}
            {minutes ? `, ${minutes} min` : ''}
          </span>
        </span>
        <span>
          <span className="entry__title">{post.title}</span>
          {post.dek ? <span className="entry__dek">{post.dek}</span> : null}
        </span>
        {fig ? (
          <span className="entry__figure">
            <b>{fig.value}</b>
            <span>{fig.label}</span>
          </span>
        ) : (
          <span aria-hidden="true" />
        )}
      </Link>
    </li>
  );
}

export function PostIndex({ posts, leadFirst = false }) {
  if (!posts.length) return null;
  return (
    <ol className="entries">
      {posts.map((p, i) => (
        <Entry key={p.slug} post={p} lead={leadFirst && i === 0} />
      ))}
    </ol>
  );
}

export function ReportCover({ post }) {
  const top = (post.stats || []).slice(0, 3);
  const ticker = post.cover_label || 'Equity research';
  return (
    <Link href={`/writing/${post.slug}`} className="cover">
      <span className="cover__top">
        <span>{ticker}</span>
        <span>{formatDate(post.published_at, { short: true })}</span>
      </span>
      <span className="cover__title">{post.title}</span>
      {post.dek ? <span className="cover__thesis">{post.dek}</span> : null}
      {top.length ? (
        <span className="cover__nums">
          {top.map((s, i) => (
            <span key={i}>
              <b>{s.value}</b>
              <span>{s.label}</span>
            </span>
          ))}
        </span>
      ) : null}
    </Link>
  );
}
