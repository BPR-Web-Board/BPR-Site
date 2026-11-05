"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { uniqueArticles } from "../../../lib/utils";
import { EnhancedPost } from "../../../lib/types";
import LargeArticlePreview from "../LargeArticlePreview/LargeArticlePreview";
import LoadingStatus from "../LoadingStatus/LoadingStatus";
import "./InfiniteScrollArticleList.css";

export interface InfiniteScrollArticleListProps {
  subsection: string;
  initialPosts: EnhancedPost[];
  initialPage?: number;
  perPage?: number;
  title?: string;
  description?: string;
}

const InfiniteScrollArticleList: React.FC<InfiniteScrollArticleListProps> = ({
  subsection,
  initialPosts,
  initialPage = 1,
  perPage = 10,
  title = "Archive",
  description = "Explore more articles from our collection",
}) => {
  const [posts, setPosts] = useState<EnhancedPost[]>(() => uniqueArticles(initialPosts));
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const requestPending = useRef(false);

  const loadMore = useCallback(async () => {
    if (requestPending.current || loading || !hasMore) return;
    requestPending.current = true;

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
        setPosts((prev) => uniqueArticles(prev, data.posts));
        setPage((prev) => prev + 1);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error loading more posts:", err);
    } finally {
      requestPending.current = false;
      setLoading(false);
    }
  }, [subsection, page, perPage, loading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore && !error) {
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
  }, [loadMore, loading, hasMore, error]);

  if (posts.length === 0 && !loading) {
    return (
      <div className="site-state width-constrained">
        <p>No articles found for this subsection.</p>
      </div>
    );
  }

  return (
    <div className="infinite-scroll-container" aria-busy={loading}>
      {/* Header */}
      <div className="infinite-scroll-header section-heading-rule">
        <h2 className="infinite-scroll-title">{title}</h2>
        <p className="infinite-scroll-description">{description}</p>
      </div>

      <div className="infinite-scroll-grid">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="infinite-scroll-item"
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

      {loading && <LoadingStatus />}

      {/* Error state */}
      {error && (
        <div className="site-state site-state-error" role="alert">
          <p>Failed to load more articles: {error}</p>
          <button onClick={loadMore} className="site-action">
            Retry
          </button>
        </div>
      )}

      {/* Intersection observer target */}
      <div ref={observerTarget} className="article-feed-trigger" aria-hidden="true" hidden={!hasMore} />
    </div>
  );
};

export default InfiniteScrollArticleList;
