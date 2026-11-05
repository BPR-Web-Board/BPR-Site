import LoadingSkeleton from "./components/shared/LoadingSkeleton/LoadingSkeleton";
import LoadingStatus from "./components/shared/LoadingStatus/LoadingStatus";

export default function Loading() {
  return <main className="page-loading" aria-busy="true" aria-label="Loading page">
    <LoadingStatus label="Loading articles…" />
    <LoadingSkeleton variant="grid" count={8} />
  </main>;
}
