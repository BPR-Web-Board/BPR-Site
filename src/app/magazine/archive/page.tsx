"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { EnhancedPost } from "../../lib/types";
import LargeArticlePreview from "../../components/shared/LargeArticlePreview/LargeArticlePreview";
import "../../mainStyle.css";
import "./archive.css";

export default function MagazineArchivePage() {
  const [articles, setArticles] = useState<EnhancedPost[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMoreArticles = useCallback(async () => {
    if (loading || !hasMore) return;

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

        setArticles((prev) => [...prev, ...olderArticles]);
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
  }, [loadMoreArticles, hasMore, loading]);

  // Initial load
  useEffect(() => {
    loadMoreArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="page-container">
      <div className="archive-content">
        {/* Header */}
        <div className="archive-header">
          <h1 className="archive-title">Magazine Archive</h1>
          <p className="archive-description">
            Explore our collection of magazine articles from earlier issues
          </p>
        </div>

        {/* Articles Grid */}
        <div className="archive-grid">
          {articles.map((article, index) => (
            <div key={`${article.id}-${index}`} className="archive-grid-item">
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

        {/* Loading State */}
        {loading && (
          <div className="archive-loading">
            <div className="loading-spinner"></div>
            <p>Loading more articles...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="archive-error">
            <p>Error loading articles: {error}</p>
            <button onClick={loadMoreArticles} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {/* End of Content */}
        {!hasMore && articles.length > 0 && (
          <div className="archive-end">
            <p>You&apos;ve reached the end of our magazine archive</p>
          </div>
        )}

        {/* No Articles */}
        {!loading && articles.length === 0 && !error && (
          <div className="archive-empty">
            <p>No archived articles available at this time</p>
          </div>
        )}

        {/* Intersection Observer Target */}
        <div ref={observerTarget} className="observer-target" />
      </div>
    </main>
  );
}
