"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { uniqueArticles } from "../../../lib/utils";
import { EnhancedPost } from "../../../lib/types";
import LargeArticlePreview from "../../../components/shared/LargeArticlePreview/LargeArticlePreview";
import LoadingStatus from "../../../components/shared/LoadingStatus/LoadingStatus";

function ArticleArchivePage() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const issue = (searchParams.get("issue") || "").trim();
  const category = (searchParams.get("category") || "").trim();
  const sort = searchParams.get("sort") === "oldest" ? "oldest" : "newest";
  const filtered = Boolean(query || issue || category);
  const requestKey = `${query}\0${issue}\0${category}\0${sort}`;

  const [articles, setArticles] = useState<EnhancedPost[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const requestPending = useRef(false);
  const activeKey = useRef(requestKey);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);

  const loadPage = useCallback(async (pageToLoad: number, key: string, replace: boolean) => {
    if (requestPending.current) return;
    if (!replace && !hasMoreRef.current) return;
    requestPending.current = true;
    setLoading(true);
    setError(null);

    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const params = new URLSearchParams({
        page: String(pageToLoad),
        per_page: "12",
        sort: key.endsWith("oldest") ? "oldest" : "newest",
      });
      const [nextQuery, nextIssue, nextCategory] = key.split("\0");
      if (nextQuery) params.set("q", nextQuery);
      if (nextIssue) params.set("issue", nextIssue);
      if (nextCategory) params.set("category", nextCategory);

      const response = await fetch(`/api/magazine-archive?${params}`);
      if (!response.ok) throw new Error("Failed to fetch articles");
      const data = await response.json();
      if (key !== activeKey.current) return;

      const posts: EnhancedPost[] = data.posts || [];
      const isFiltered = Boolean(nextQuery || nextIssue || nextCategory);
      const nextArticles = isFiltered
        ? posts
        : posts.filter((post) => new Date(post.date) < sixMonthsAgo);

      setArticles((prev) => uniqueArticles(replace ? [] : prev, nextArticles));
      const nextPage = pageToLoad + 1;
      pageRef.current = nextPage;
      setPage(nextPage);

      const totalPages = Number(data.total_pages || 0);
      const more = posts.length >= 12 && !(totalPages > 0 && pageToLoad >= totalPages);
      hasMoreRef.current = more;
      setHasMore(more);
    } catch (err) {
      if (key !== activeKey.current) return;
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error loading articles:", err);
    } finally {
      if (key === activeKey.current) {
        requestPending.current = false;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    activeKey.current = requestKey;
    hasMoreRef.current = true;
    pageRef.current = 1;
    requestPending.current = false;
    setArticles([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    loadPage(1, requestKey, true);
  }, [requestKey, loadPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !requestPending.current) {
          loadPage(pageRef.current, activeKey.current, false);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [loadPage, articles.length, hasMore]);

  return (
    <section aria-label="Articles" className="archive-articles">
      <div className="archive-grid" aria-busy={loading}>
        {articles.map((article, index) => (
          <div key={article.id} className="archive-grid-item">
            <LargeArticlePreview
              article={article}
              excerptLength={200}
              variant="default"
              imagePosition={index % 4 < 2 ? "left" : "right"}
              className="archive-article-preview"
            />
          </div>
        ))}
      </div>

      {loading && <LoadingStatus />}

      {error && (
        <div className="site-state site-state-error" role="alert">
          <p>Error loading articles: {error}</p>
          <button
            onClick={() => loadPage(pageRef.current, activeKey.current, page === 1 && articles.length === 0)}
            className="site-action"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !hasMore && articles.length === 0 && !error && (
        <div className="site-state">
          <p>{filtered ? "No articles match these filters." : "No archived articles available at this time"}</p>
        </div>
      )}

      <div ref={observerTarget} className="article-feed-trigger" aria-hidden="true" hidden={!hasMore} />
    </section>
  );
}

export default function ArticleArchivePageSuspense() {
  return (
    <Suspense fallback={<LoadingStatus label="Loading articles…" />}>
      <ArticleArchivePage />
    </Suspense>
  );
}
