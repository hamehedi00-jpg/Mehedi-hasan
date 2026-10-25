import { OG_SIZE, renderCard } from '@/lib/og';
import { getPost } from '@/lib/posts';
import { formatDate } from '@/lib/format';

export const alt = 'Article by Mehedi Hasan';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 300;

export default async function Image({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return renderCard({ kicker: 'Writing', title: 'Mehedi Hasan', footer: 'Writing from Dhaka' });
  }
  return renderCard({
    kicker: post.kind === 'report' ? `${post.category} research` : post.category,
    title: post.title,
    footer: formatDate(post.published_at),
  });
}
