"use client";

import React from "react";
import { EnhancedPost } from "../../lib/types";
import { FeaturedArticle, SmallArticlePreview } from "../shared";
import "./ArticleLayout.css";

interface ArticleLayoutProps {
  posts: EnhancedPost[];
  categoryName?: string;
  className?: string;
}

const ArticleLayout: React.FC<ArticleLayoutProps> = ({
  posts,
  categoryName,
  className = "",
}) => {
  if (!posts || posts.length === 0) {
    return (
      <div className={`article-layout error ${className}`}>
        <div className="error-message">No articles available</div>
      </div>
    );
  }

  const featuredArticle = posts[0];
  const sideArticles = posts.slice(1, 5); // Get up to 4 side articles

  return (
    <div className={`article-layout ${className}`}>
      <div className="section-header">
        <h2 className="section-title">{categoryName || "Popular Articles"}</h2>
        <div className="section-divider"></div>
      </div>

      <div className="articles-container">
        {/* Featured Article - LEFT SIDE */}
        <div className="featured-article-wrapper">
          <FeaturedArticle
            article={featuredArticle}
            excerptLength={200}
            imagePosition="top"
            variant="default"
            className="article-layout-featured"
          />
        </div>

        {/* Side Articles - RIGHT SIDE */}
        <div className="side-articles">
          {sideArticles.map((article, index) => (
            <React.Fragment key={article.id}>
              {index > 0 && <div className="side-article-divider"></div>}
              <div className="side-article-item">
                <SmallArticlePreview
                  article={article}
                  excerptLength={80}
                  imagePosition="right"
                  variant="default"
                  className="article-layout-side"
                />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArticleLayout;
