"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./not-found.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-container not-found-page error-page">
      <div className="not-found-content">
        <h1>Something went wrong</h1>
        <p>This page failed to load. Try again, or head back to the homepage.</p>
        <div className="not-found-actions">
          <button type="button" className="site-action" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="site-action">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
