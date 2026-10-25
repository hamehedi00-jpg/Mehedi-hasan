import Studio from './Studio';
import './studio.css';

export const metadata = {
  title: 'Studio',
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <Studio />;
}
