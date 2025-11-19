"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { EnhancedPost } from "../../../lib/types";
import LargeArticlePreview from "../LargeArticlePreview/LargeArticlePreview";
import "./InfiniteScrollArticleList.css";

export interface InfiniteScrollArticleListProps {
  subsection: string;
  initialPosts: EnhancedPost[];
  initialPage?: number;
  perPage?: number;
}

const InfiniteScrollArticleList: React.FC<InfiniteScrollArticleListProps> = ({
  subsection,
  initialPosts,
  initialPage = 1,
  perPage = 10,
}) => {
  const [posts, setPosts] = useState<EnhancedPost[]>(initialPosts);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/subsection-posts?subsection=${encodeURIComponent(
          subsection
        )}&page=${page + 1}&per_page=${perPage}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();

      if (data.posts && data.posts.length > 0) {
        setPosts((prev) => [...prev, ...data.posts]);
        setPage((prev) => prev + 1);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error loading more posts:", err);
    } finally {
      setLoading(false);
    }
  }, [subsection, page, perPage, loading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMore();
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
  }, [loadMore, loading, hasMore]);

  if (posts.length === 0 && !loading) {
    return (
      <div className="infinite-scroll-empty">
        <p>No articles found for this subsection.</p>
      </div>
    );
  }

  return (
    <div className="infinite-scroll-container">
      {/* Header */}
      <div className="infinite-scroll-header">
        <h2 className="infinite-scroll-title">Archive</h2>
        <p className="infinite-scroll-description">
          Explore more articles from our collection
        </p>
      </div>

      <div className="infinite-scroll-grid">
        {posts.map((post, index) => (
          <div
            key={`${post.id}-${index}`}
            className="infinite-scroll-item"
            style={{
              animationDelay: `${(index % perPage) * 50}ms`,
            }}
          >
            <LargeArticlePreview
              article={post}
              excerptLength={200}
              variant="default"
              imagePosition={index % 4 < 2 ? "left" : "right"}
              className="infinite-scroll-article-preview"
            />
          </div>
        ))}
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="infinite-scroll-loading">
          <div className="loading-spinner"></div>
          <p>Loading more articles...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="infinite-scroll-error">
          <p>Failed to load more articles: {error}</p>
          <button onClick={loadMore} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {/* End of content */}
      {!hasMore && !loading && posts.length > 0 && (
        <div className="infinite-scroll-end">
          <p>You&apos;ve reached the end of the articles</p>
        </div>
      )}

      {/* Intersection observer target */}
      <div ref={observerTarget} className="infinite-scroll-trigger" />
    </div>
  );
};

export default InfiniteScrollArticleList;
