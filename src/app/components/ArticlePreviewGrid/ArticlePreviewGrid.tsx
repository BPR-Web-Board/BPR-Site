"use client";

import React from "react";
import { EnhancedPost } from "../../lib/types";
import FeaturedArticle from "../shared/FeaturedArticle";
import SmallArticlePreview from "../shared/SmallArticlePreview";
import "./ArticlePreviewGrid.css";

export interface ArticlePreviewGridProps {
  articles: EnhancedPost[];
  className?: string;
}

const ArticlePreviewGrid: React.FC<ArticlePreviewGridProps> = ({
  articles,
  className = "",
}) => {
  if (!articles || articles.length === 0) {
    return (
      <div className="article-preview-grid-empty">No articles available</div>
    );
  }

  // Ensure we have enough articles, or use available ones
  const leftArticles = articles.slice(0, 2);
  const centerArticle = articles[2] || articles[0];
  const rightArticles = articles.slice(3, 8);

  return (
    <div className={`article-preview-grid ${className}`}>
      {/* Left Column - Medium Articles */}
      <div className="apg-left-column">
        {leftArticles.map((article, index) => (
          <div key={article.id} className="apg-medium-article">
            <SmallArticlePreview
              article={article}
              excerptLength={120}
              variant="preview-grid"
              imagePosition="left"
              className="apg-medium-preview"
            />
          </div>
        ))}
      </div>

      {/* Center Column - Large Featured Article */}
      <div className="apg-center-column">
        <FeaturedArticle
          article={centerArticle}
          excerptLength={200}
          variant="preview-grid"
          imagePosition="top"
          className="apg-featured-article"
        />
      </div>

      {/* Right Column - Small Sidebar Articles */}
      <div className="apg-right-column">
        {rightArticles.map((article, index) => (
          <div key={article.id} className="apg-sidebar-article">
            <SmallArticlePreview
              article={article}
              excerptLength={0}
              variant="preview-grid"
              showImage={true}
              imagePosition="right"
              className="apg-sidebar-preview"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticlePreviewGrid;
