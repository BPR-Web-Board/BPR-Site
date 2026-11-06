import LoadingStatus from "../shared/LoadingStatus/LoadingStatus";
import "../shared/LoadingSkeleton/LoadingSkeleton.css";
import "./ArticlePageLoading.css";

export default function ArticlePageLoading() {
  return (
    <main className="page-loading article-page-loading" aria-busy="true" aria-label="Loading article">
      <div className="article-page-skeleton">
        <div className="article-page-skeleton-header">
          <div className="article-page-skeleton-lead">
            <LoadingStatus label="Loading article…" />
            <div className="article-page-skeleton-title" aria-hidden="true">
              <div className="skeleton-text skeleton-pulse" style={{ width: "88%", height: "2rem" }} />
              <div className="skeleton-text skeleton-pulse" style={{ width: "64%", height: "2rem" }} />
              <div className="skeleton-text skeleton-pulse" style={{ width: "70%", height: "14px" }} />
              <div className="skeleton-text skeleton-pulse" style={{ width: "44%", height: "14px" }} />
            </div>
          </div>
          <div className="article-page-skeleton-image skeleton-pulse" aria-hidden="true" />
        </div>
        <div className="article-page-skeleton-body" aria-hidden="true">
          <div className="article-page-skeleton-meta" />
          <div className="article-page-skeleton-copy">
            <div className="skeleton-text skeleton-pulse" style={{ width: "100%" }} />
            <div className="skeleton-text skeleton-pulse" style={{ width: "96%" }} />
            <div className="skeleton-text skeleton-pulse" style={{ width: "92%" }} />
            <div className="skeleton-text skeleton-pulse" style={{ width: "88%" }} />
            <div className="skeleton-text skeleton-pulse" style={{ width: "74%" }} />
          </div>
        </div>
      </div>
    </main>
  );
}
