import { OG_SIZE, renderCard } from '@/lib/og';

export const alt = 'Mehedi Hasan: markets, policy and geopolitics, examined from Dhaka.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  return renderCard({
    kicker: 'Markets, policy, politics and geopolitics',
    title: 'Markets, policy and geopolitics, examined from Dhaka.',
    footer: 'Writing from Dhaka',
  });
}
