export default function IssuePdfSkeleton({ label = "Loading preview" }: { label?: string } = {}) {
  return (
    <div className="issue-pdf-preview issue-pdf-skeleton" role="status" aria-busy="true" aria-label={label}>
      <div className="issue-pdf-skeleton-spread" aria-hidden="true">
        <div className="issue-pdf-skeleton-page" />
        <div className="issue-pdf-skeleton-page" />
      </div>
    </div>
  );
}
