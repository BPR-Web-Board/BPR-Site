import IssuePdfSkeleton from "../../../components/IssuePdfPreview/IssuePdfSkeleton";
import LoadingStatus from "../../../components/shared/LoadingStatus/LoadingStatus";
import "../../../components/IssuePdfPreview/IssuePdfPreview.css";

export default function IssueLoading() {
  return (
    <main className="page-loading" aria-busy="true" aria-label="Loading issue">
      <LoadingStatus label="Loading issue…" />
      <div className="issue-pdf-stage">
        <IssuePdfSkeleton />
      </div>
    </main>
  );
}
