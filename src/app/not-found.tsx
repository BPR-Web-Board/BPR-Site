import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-container not-found-page">
      <div className="not-found-content">
        <h1>Page not found</h1>
        <p>
          The page you’re looking for doesn’t exist, may have moved, or is no longer available.
        </p>
        <div className="not-found-actions">
          <Link href="/" className="site-action">Home</Link>
          <Link href="/magazine" className="site-action">Latest Issue</Link>
          <Link href="/search" className="site-action">Search</Link>
        </div>
      </div>
    </main>
  );
}
