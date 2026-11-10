"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { stripHtml, uniqueArticles } from "../../../lib/utils";
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
  excludeIds?: number[];
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

function isTransientNetworkError(error: unknown): boolean {
  return error instanceof TypeError && /failed to fetch|networkerror|load failed/i.test(error.message);
}

const InfiniteScrollArticleList: React.FC<InfiniteScrollArticleListProps> = ({
  subsection,
  initialPosts,
  initialPage = 1,
  perPage = 10,
  title = "Archive",
  description = "Explore more articles from our collection",
  excludeIds = [],
}) => {
  const [posts, setPosts] = useState<EnhancedPost[]>(() => uniqueArticles(initialPosts));
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const requestPending = useRef(false);
  const excluded = useRef(new Set(excludeIds));
  const abortRef = useRef<AbortController | null>(null);
  const postsRef = useRef(posts);
  postsRef.current = posts;

  const loadMore = useCallback(async () => {
    if (requestPending.current || loading || !hasMore) return;
    requestPending.current = true;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const collected: EnhancedPost[] = [];
      const seen = new Set<number>([
        ...excluded.current,
        ...postsRef.current.map((post) => post.id),
      ]);
      let nextPage = page;
      let apiHasMore = true;
      let pagesFetched = 0;

      while (collected.length < perPage && apiHasMore && pagesFetched < 5) {
        nextPage += 1;
        pagesFetched += 1;

        const response = await fetch(
          `/api/subsection-posts?subsection=${encodeURIComponent(
            subsection
          )}&page=${nextPage}&per_page=${perPage}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        apiHasMore = Boolean(data.hasMore);

        if (!data.posts?.length) {
          apiHasMore = false;
          break;
        }

        for (const post of data.posts as EnhancedPost[]) {
          if (seen.has(post.id)) continue;
          seen.add(post.id);
          collected.push(post);
          if (collected.length >= perPage) break;
        }
      }

      if (controller.signal.aborted) return;

      if (collected.length > 0) {
        setPosts((prev) => uniqueArticles(prev, collected));
        setPage(nextPage);
        setHasMore(apiHasMore);
      } else {
        setPage(nextPage);
        setHasMore(false);
      }
    } catch (err) {
      if (isAbortError(err) || controller.signal.aborted) return;
      if (isTransientNetworkError(err)) {
        setHasMore(false);
        return;
      }
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      requestPending.current = false;
      setLoading(false);
    }
  }, [subsection, page, perPage, loading, hasMore]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasMore || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore, hasMore, error]);

  if (posts.length === 0 && !loading) {
    return (
      <div className="site-state width-constrained">
        <p>No articles found for this subsection.</p>
      </div>
    );
  }

  return (
    <div className="infinite-scroll-container" aria-busy={loading}>
      <div className="infinite-scroll-header section-heading-rule">
        <h2 className="infinite-scroll-title">{stripHtml(title)}</h2>
        <p className="infinite-scroll-description">{description}</p>
      </div>

      <div className="infinite-scroll-grid">
        {posts.map((post, index) => (
          <div key={post.id} className="infinite-scroll-item">
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

      {error && (
        <div className="site-state site-state-error" role="alert">
          <p>Failed to load more articles: {error}</p>
          <button onClick={loadMore} className="site-action">
            Retry
          </button>
        </div>
      )}

      <div
        ref={observerTarget}
        className="article-feed-trigger"
        aria-hidden="true"
        hidden={!hasMore}
      />
    </div>
  );
};

export default InfiniteScrollArticleList;
