import { Suspense } from "react";
import SearchResults from "./SearchResults";
import SearchResultsSkeleton from "./SearchResultsSkeleton";
import SearchShell from "./SearchShell";
import "../components/WordPressPuzzlePage/content-pages.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search | Brown Political Review" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query =
    typeof params.q === "string" ? params.q.trim().slice(0, 280) : "";
  const page =
    typeof params.page === "string" && /^\d+$/.test(params.page)
      ? Math.max(1, Math.min(10000, Number(params.page)))
      : 1;

  return (
    <main className="backend-content-page">
      <h1 className="section-heading-rule">Search</h1>
      <SearchShell query={query}>
        {!query && <p>Enter a term to search BPR articles.</p>}
        {query && (
          <Suspense
            key={`${query}-${page}`}
            fallback={<SearchResultsSkeleton query={query} />}
          >
            <SearchResults query={query} page={page} />
          </Suspense>
        )}
      </SearchShell>
    </main>
  );
}
