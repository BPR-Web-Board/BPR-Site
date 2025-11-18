import React from "react";
import "./LoadingSkeleton.css";

interface LoadingSkeletonProps {
  variant?: "hero" | "article" | "grid" | "text";
  count?: number;
}

export default function LoadingSkeleton({
  variant = "article",
  count = 1,
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count });

  if (variant === "hero") {
    return (
      <div className="skeleton-hero">
        <div className="skeleton-hero-image skeleton-pulse" />
        <div className="skeleton-hero-content">
          <div className="skeleton-text skeleton-pulse" style={{ width: "70%" }} />
          <div className="skeleton-text skeleton-pulse" style={{ width: "50%", height: "20px" }} />
        </div>
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className="skeleton-grid">
        {skeletons.map((_, i) => (
          <div key={i} className="skeleton-article-card">
            <div className="skeleton-image skeleton-pulse" />
            <div className="skeleton-text skeleton-pulse" style={{ width: "90%" }} />
            <div className="skeleton-text skeleton-pulse" style={{ width: "70%" }} />
            <div className="skeleton-text skeleton-pulse" style={{ width: "50%", height: "16px" }} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className="skeleton-text-block">
        {skeletons.map((_, i) => (
          <div
            key={i}
            className="skeleton-text skeleton-pulse"
            style={{ width: i % 3 === 0 ? "60%" : "90%" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="skeleton-article">
      <div className="skeleton-image skeleton-pulse" />
      <div className="skeleton-content">
        <div className="skeleton-text skeleton-pulse" style={{ width: "90%" }} />
        <div className="skeleton-text skeleton-pulse" style={{ width: "70%" }} />
        <div className="skeleton-text skeleton-pulse" style={{ width: "50%", height: "16px" }} />
      </div>
    </div>
  );
}
