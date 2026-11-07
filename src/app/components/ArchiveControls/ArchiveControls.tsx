"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { stripHtml } from "../../lib/utils";
import "./ArchiveControls.css";

export type ArchiveIssueOption = { slug: string; title: string };
export type ArchiveCategoryOption = { slug: string; name: string };

export default function ArchiveControls({
  issues,
  categories,
}: {
  issues: ArchiveIssueOption[];
  categories: ArchiveCategoryOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const isArticlesView = pathname.startsWith("/magazine/archive");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const updateParams = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    if (!isArticlesView) {
      params.delete("q");
      params.delete("issue");
      params.delete("category");
    }
    const next = params.toString();
    startTransition(() => {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    });
  };

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({ q: query.trim() || null });
  };

  const sortOldest = searchParams.get("sort") === "oldest";
  const SortIcon = sortOldest ? ArrowUpWideNarrow : ArrowDownWideNarrow;

  return (
    <div className="archive-controls">
      {isArticlesView ? (
        <div className="archive-controls-filters">
          <form className="archive-controls-search" role="search" onSubmit={onSearch}>
            <label className="visually-hidden" htmlFor="archive-search">Search archive</label>
            <input
              id="archive-search"
              type="search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search articles…"
              maxLength={280}
            />
            <button type="submit" className="archive-controls-search-submit" aria-label="Search archive">
              <Search size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </form>

          <label className="archive-controls-field">
            <span className="visually-hidden">Filter by issue</span>
            <select
              value={searchParams.get("issue") || ""}
              onChange={(event) => updateParams({ issue: event.target.value || null })}
              aria-label="Filter by issue"
            >
              <option value="">All issues</option>
              {issues.map((issue) => (
                <option key={issue.slug} value={issue.slug}>{stripHtml(issue.title)}</option>
              ))}
            </select>
          </label>

          <label className="archive-controls-field">
            <span className="visually-hidden">Filter by category</span>
            <select
              value={searchParams.get("category") || ""}
              onChange={(event) => updateParams({ category: event.target.value || null })}
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>{stripHtml(category.name)}</option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <button
        type="button"
        className="archive-controls-sort"
        aria-label={sortOldest ? "Sorted oldest first. Switch to newest first" : "Sorted newest first. Switch to oldest first"}
        title={sortOldest ? "Oldest first" : "Newest first"}
        onClick={() => updateParams({ sort: sortOldest ? null : "oldest" })}
      >
        <SortIcon size={20} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  );
}
