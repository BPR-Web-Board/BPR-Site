"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageFlipOpen } from "pageflipopen";
import "pageflipopen/pageflipopen.css";

function resolveSource(url: string) {
  if (url.startsWith("/")) return url;
  try {
    if (new URL(url).origin === window.location.origin) return url;
  } catch {}
  return `/api/issue-pdf?url=${encodeURIComponent(url)}`;
}

function CoverFallback({ cover, title }: { cover?: string; title: string }) {
  return (
    <div className="issue-pdf-preview" aria-label={`${title} cover preview`}>
      <div className="issue-pdf-cover-fallback">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={`${title} cover`} />
        ) : (
          <div className="issue-pdf-preview-status" role="status">Preview unavailable</div>
        )}
      </div>
    </div>
  );
}

const MOBILE_PDF_QUERY = "(max-width: 767px)";

export default function IssuePdfFlipbook({ url, title, cover }: { url: string; title: string; cover?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const flipbookRef = useRef<InstanceType<typeof PageFlipOpen> | null>(null);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [singlePage, setSinglePage] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_PDF_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_PDF_QUERY);
    const sync = () => setSinglePage(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let flipbook: InstanceType<typeof PageFlipOpen> | null = null;
    let cancelled = false;
    setError(false);
    setReady(false);
    setPage(1);
    setTotalPages(1);

    const timer = window.setTimeout(() => {
      if (cancelled || !host.isConnected) return;
      try {
        PageFlipOpen.setPdfWorkerSrc("/pageflipopen.worker.mjs");
        const surface = getComputedStyle(document.documentElement)
          .getPropertyValue("--surface")
          .trim() || "#fffefa";
        const startPage = singlePage ? 1 : 2;
        flipbook = new PageFlipOpen(host, {
          source: resolveSource(url),
          startPage,
          singlePageMode: singlePage,
          autoLayout: !singlePage,
          autoHeight: true,
          enableZoom: true,
          enableFullscreen: false,
          enableDownload: false,
          toolbar: false,
          backgroundColor: "transparent",
          pageBackground: surface,
          flipDuration: 850,
          onReady: () => {
            if (cancelled || !flipbook) return;
            flipbookRef.current = flipbook;
            if (!singlePage && flipbook.totalPages >= 2 && flipbook.currentPage < 2) {
              flipbook.flipTo(2);
            }
            setPage(flipbook.currentPage);
            setTotalPages(flipbook.totalPages);
            setReady(true);
          },
          onPageChange: (pageNumber: number) => {
            if (cancelled || !flipbook) return;
            setPage(pageNumber);
            setTotalPages(flipbook.totalPages);
          },
          onError: () => {
            if (!cancelled) setError(true);
          },
        });
      } catch {
        if (!cancelled) setError(true);
      }
    }, 50);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      flipbookRef.current = null;
      try { flipbook?.destroy(); } catch {}
    };
  }, [url, singlePage]);

  if (error) return <CoverFallback cover={cover} title={title} />;

  const atFirst = page <= 1;
  const atLast = page >= totalPages;

  return (
    <div
      className={`issue-pdf-preview${ready ? " is-ready" : ""}${singlePage ? " is-single-page" : ""}`}
      aria-label={`${title} PDF preview`}
      aria-busy={!ready}
    >
      <button
        type="button"
        className="issue-pdf-nav issue-pdf-nav-prev"
        aria-label="Previous page"
        disabled={!ready || atFirst}
        onClick={() => flipbookRef.current?.prev()}
      >
        <ChevronLeft size={36} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <div className="issue-pdf-viewer">
        {!ready ? (
          <div className="issue-pdf-skeleton-overlay" aria-hidden="true">
            <div className="issue-pdf-skeleton-spread">
              <div className="issue-pdf-skeleton-page" />
              <div className="issue-pdf-skeleton-page" />
            </div>
          </div>
        ) : null}
        <div ref={hostRef} className="issue-pdf-flipbook-host" />
      </div>
      <button
        type="button"
        className="issue-pdf-nav issue-pdf-nav-next"
        aria-label="Next page"
        disabled={!ready || atLast}
        onClick={() => flipbookRef.current?.next()}
      >
        <ChevronRight size={36} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  );
}
