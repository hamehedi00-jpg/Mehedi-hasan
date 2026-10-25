import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from '@/components/Markdown';
import Subscribe from '@/components/Subscribe';
import { PostIndex, Stats, kindLabel } from '@/components/Lists';
import { ReadingProgress, Share, Toc } from '@/components/ArticleChrome';
import Footnotes from '@/components/Footnotes';
import { getPost, getPublishedPosts } from '@/lib/posts';
import { SITE, categoryHref, formatDate, readingMinutes } from '@/lib/format';
import { headingsOf } from '@/lib/toc';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Not found' };
  return {
    title: post.title,
    description: post.dek || SITE.description,
    alternates: { canonical: `/writing/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.dek || '',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [SITE.author],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.dek || '' },
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const [post, all] = await Promise.all([getPost(slug), getPublishedPosts()]);
  if (!post) notFound();

  const url = `${SITE.url}/writing/${post.slug}`;
  const toc = headingsOf(post.body);
  const minutes = readingMinutes(post.body);
  const more = all.filter((p) => p.slug !== post.slug).slice(0, 3);
  const updated =
    post.updated_at && new Date(post.updated_at) - new Date(post.published_at) > 86400000 ? post.updated_at : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.dek,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { '@type': 'Person', name: SITE.author, url: `${SITE.url}/about` },
    mainEntityOfPage: url,
  };

  return (
    <>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="wrap" data-article>
        <header className="article-head">
          <Link className="article-head__cat" href={post.kind === 'report' ? '/research' : categoryHref(post.category)}>
            {post.category} · {kindLabel(post.kind)}
          </Link>
          <h1>{post.title}</h1>
          {post.dek ? <p className="article-head__dek">{post.dek}</p> : null}
          <div className="byline">
            <div className="byline__who">
              <Link className="byline__name" href="/about">
                {SITE.author}
              </Link>
              <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
              <span>{minutes} minute read</span>
              {updated ? <span>Updated {formatDate(updated)}</span> : null}
            </div>
            <Share url={url} title={post.title} />
          </div>
        </header>

        <div className="article-body">
          {post.stats?.length || post.pdf_url || toc.length > 1 ? (
            <aside className="margin" aria-label="About this piece">
              {post.stats?.length ? (
                <section className="margin-block">
                  <h2>Key figures</h2>
                  <Stats stats={post.stats} />
                </section>
              ) : null}
              {post.pdf_url ? (
                <section className="margin-block">
                  <a className="pdf" href={post.pdf_url} target="_blank" rel="noopener">
                    <strong>Download the full report</strong>
                    <span>{post.pdf_note || 'PDF with every table, chart and source'}</span>
                  </a>
                </section>
              ) : null}
              <Toc items={toc} />
            </aside>
          ) : null}
          <div className="prose" lang={post.lang || 'en'}>
            <Markdown>{post.body}</Markdown>
            <p className="disclaimer">
              The views here are my own. This piece is for education and discussion, not investment advice or a
              recommendation to buy, sell or hold any security. Figures are as stated in the sources at the time of
              writing and should be checked against the original filings before you rely on them.
            </p>
          </div>
        </div>
        <Footnotes />
      </article>

      {more.length ? (
        <div className="wrap more">
          <div className="head">
            <h2>More writing</h2>
            <Link href="/writing">All writing</Link>
          </div>
          <PostIndex posts={more} />
        </div>
      ) : null}

      <div className="wrap">
        <Subscribe />
      </div>
    </>
  );
}
