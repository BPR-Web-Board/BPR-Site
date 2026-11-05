"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { uniqueArticles } from "../../../lib/utils";
import { EnhancedPost } from "../../../lib/types";
import LargeArticlePreview from "../../../components/shared/LargeArticlePreview/LargeArticlePreview";
import LoadingStatus from "../../../components/shared/LoadingStatus/LoadingStatus";

export default function ArticleArchivePage() {
  const [articles, setArticles] = useState<EnhancedPost[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const requestPending = useRef(false);

  const loadMoreArticles = useCallback(async () => {
    if (requestPending.current || loading || !hasMore) return;
    requestPending.current = true;

    setLoading(true);
    setError(null);

    try {
      // Calculate the date 6 months ago for filtering
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const response = await fetch(
        `/api/magazine-archive?page=${page}&per_page=12`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }

      const data = await response.json();

      if (data.posts && data.posts.length > 0) {
        // Filter out articles from the last 6 months (those are on main page)
        const olderArticles = data.posts.filter((post: EnhancedPost) => {
          const postDate = new Date(post.date);
          return postDate < sixMonthsAgo;
        });

        setArticles((prev) => uniqueArticles(prev, olderArticles));
        setPage((prev) => prev + 1);

        // If we got fewer than requested, we've reached the end
        if (data.posts.length < 12) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error loading articles:", err);
    } finally {
      requestPending.current = false;
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreArticles();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMoreArticles, hasMore, loading, error]);

  // Initial load
  useEffect(() => {
    loadMoreArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section aria-label="Articles" className="archive-articles">
        {/* Articles Grid */}
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

        {/* Error State */}
        {error && (
          <div className="site-state site-state-error" role="alert">
            <p>Error loading articles: {error}</p>
            <button onClick={loadMoreArticles} className="site-action">
              Retry
            </button>
          </div>
        )}

        {/* No Articles */}
        {!loading && !hasMore && articles.length === 0 && !error && (
          <div className="site-state">
            <p>No archived articles available at this time</p>
          </div>
        )}

        {/* Intersection Observer Target */}
        <div ref={observerTarget} className="article-feed-trigger" aria-hidden="true" hidden={!hasMore} />
    </section>
  );
}
