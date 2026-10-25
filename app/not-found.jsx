import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap">
      <header className="pagehead" style={{ borderBottom: 0 }}>
        <h1>This page could not be found.</h1>
        <p>The address may be mistyped, or the piece may have moved.</p>
        <p style={{ marginTop: 28 }}>
          <Link className="btn" href="/writing">
            See all writing
          </Link>
        </p>
      </header>
    </div>
  );
}
