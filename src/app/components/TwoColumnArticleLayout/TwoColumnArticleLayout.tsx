"use client";

import React from "react";
import { EnhancedPost } from "../../lib/types";
import { FeaturedArticle, SmallArticlePreview } from "../shared";
import "./TwoColumnArticleLayout.css";

export interface TwoColumnArticleLayoutProps {
  posts: EnhancedPost[];
  sectionTitle?: string;
  leftColumnArticles?: number;
  rightColumnArticles?: number;
  className?: string;
}

const TwoColumnArticleLayout: React.FC<TwoColumnArticleLayoutProps> = ({
  posts,
  sectionTitle = "United States",
  leftColumnArticles = 3,
  rightColumnArticles = 5,
  className = "",
}) => {
  if (!posts || posts.length === 0) {
    return (
      <div className={`two-column-layout ${className}`}>
        <div className="section-header">
          <h2 className="section-title">{sectionTitle}</h2>
        </div>
        <div className="error-message">No articles available</div>
      </div>
    );
  }

  // Split articles into left and right columns
  const totalArticles = leftColumnArticles + rightColumnArticles;
  const articles = posts.slice(0, totalArticles);
  const leftColumnPosts = articles.slice(0, leftColumnArticles);
  const rightColumnPosts = articles.slice(
    leftColumnArticles,
    leftColumnArticles + rightColumnArticles
  );

  return (
    <div className={`two-column-layout ${className}`}>
      {/* Section Header with Title and Divider */}
      <div className="section-header">
        <h2
          className="section-title"
          dangerouslySetInnerHTML={{ __html: sectionTitle }}
        />
        <div className="section-divider"></div>
      </div>

      {/* Two Column Content */}
      <div className="columns-container">
        {/* Left Column */}
        <div className="left-column">
          {/* Featured Article */}
          {leftColumnPosts.length > 0 && (
            <FeaturedArticle
              article={leftColumnPosts[0]}
              excerptLength={300}
              imagePosition="top"
              variant="default"
              className="two-column-featured"
            />
          )}

          {/* Small Articles in Left Column */}
          <div className="left-small-articles">
            {leftColumnPosts.slice(1).map((article, index) => (
              <div key={article.id} className="small-article-wrapper">
                <SmallArticlePreview
                  article={article}
                  excerptLength={150}
                  imagePosition="left"
                  variant="default"
                  className="two-column-small left-column-small"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {rightColumnPosts.map((article, index) => (
            <div key={article.id} className="small-article-wrapper">
              <SmallArticlePreview
                article={article}
                excerptLength={150}
                imagePosition="left"
                variant="default"
                className="two-column-small right-column-small"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TwoColumnArticleLayout;
