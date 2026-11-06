import { ChevronLeft, ChevronRight } from "lucide-react";

export default function IssuePdfSkeleton({ label = "Loading preview" }: { label?: string } = {}) {
  return (
    <div className="issue-pdf-preview issue-pdf-skeleton" role="status" aria-busy="true" aria-label={label}>
      <button type="button" className="issue-pdf-nav issue-pdf-nav-prev" aria-label="Previous page" disabled>
        <ChevronLeft size={36} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <div className="issue-pdf-viewer">
        <div className="issue-pdf-skeleton-spread" aria-hidden="true">
          <div className="issue-pdf-skeleton-page" />
          <div className="issue-pdf-skeleton-page" />
        </div>
      </div>
      <button type="button" className="issue-pdf-nav issue-pdf-nav-next" aria-label="Next page" disabled>
        <ChevronRight size={36} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  );
}
