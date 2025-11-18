import React from "react";
import LoadingSkeleton from "./components/shared/LoadingSkeleton/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="page-container">
      <div className="featured-content">
        <LoadingSkeleton variant="hero" />
        <div className="article-layout-wrapper">
          <LoadingSkeleton variant="grid" count={10} />
        </div>
      </div>
      <div className="main-content">
        <LoadingSkeleton variant="article" count={5} />
      </div>
    </div>
  );
}
