"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          fontFamily: "Georgia, 'Times New Roman', serif",
          background: "#0d0b00",
          color: "#fffefa",
        }}
      >
        <main style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ margin: "0 0 1rem", fontSize: "2rem", fontWeight: 600 }}>
            Something went wrong
          </h1>
          <p style={{ margin: "0 0 1.5rem", lineHeight: 1.5, opacity: 0.85 }}>
            The site hit an unexpected error. You can try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: 44,
              padding: "0.5rem 1rem",
              border: "1px solid currentColor",
              background: "transparent",
              color: "inherit",
              font: "inherit",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
