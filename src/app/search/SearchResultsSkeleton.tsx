import LoadingSkeleton from "../components/shared/LoadingSkeleton/LoadingSkeleton";
import "../components/shared/LoadingSkeleton/LoadingSkeleton.css";

export default function SearchResultsSkeleton({ query }: { query: string }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <p>{query ? `Searching for “${query}”…` : "Loading search results…"}</p>
      <div className="search-results" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <LoadingSkeleton key={index} variant="article" />
        ))}
      </div>
    </div>
  );
}
