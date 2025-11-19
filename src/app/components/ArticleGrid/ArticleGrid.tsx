"use client";

import React from "react";
import { EnhancedPost } from "../../lib/types";
import LargeArticlePreview from "../shared/LargeArticlePreview/LargeArticlePreview";
import "./ArticleGrid.css";

interface ArticleGridProps {
  posts: EnhancedPost[];
  categoryName?: string;
  maxArticles?: number;
}

const ArticleGrid: React.FC<ArticleGridProps> = ({
  posts,
  categoryName,
  maxArticles = 4,
}) => {
  // Skip rendering if we don't have at least 4 articles
  if (!posts || posts.length < 4) {
    return null;
  }

  // Use exactly 4 articles
  const displayArticles = posts.slice(0, Math.min(maxArticles, 4));

  return (
    <div className="article-grid">
      {/* Category Title */}
      <div className="grid-header">
        <h2 className="grid-title">{categoryName || "Articles"}</h2>
      </div>

      {/* Articles Grid */}
      <div className="articles-container">
        {/* Top Row - Images on Left */}
        <div className="top-row">
          {/* Left */}
          <div className="grid-item">
            <LargeArticlePreview
              article={displayArticles[0]}
              excerptLength={250}
              variant="default"
              imagePosition="left"
              className="article-grid-preview"
            />
          </div>

          {/* Right */}
          <div className="grid-item">
            <LargeArticlePreview
              article={displayArticles[1]}
              excerptLength={250}
              variant="default"
              imagePosition="left"
              className="article-grid-preview"
            />
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="horizontal-divider"></div>

        {/* Bottom Row - Images on Right */}
        <div className="bottom-row">
          {/* Left */}
          <div className="grid-item">
            <LargeArticlePreview
              article={displayArticles[2]}
              excerptLength={250}
              variant="default"
              imagePosition="right"
              className="article-grid-preview"
            />
          </div>

          {/* Right */}
          <div className="grid-item">
            <LargeArticlePreview
              article={displayArticles[3]}
              excerptLength={250}
              variant="default"
              imagePosition="right"
              className="article-grid-preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleGrid;
