"use client";

import React from "react";
import { EnhancedPost } from "../../lib/types";
import { ArticleCard } from "../shared";
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
  if (!posts || posts.length === 0) {
    return (
      <div className="article-grid">
        <div className="grid-header">
          <h2 className="grid-title">{categoryName || "Articles"}</h2>
        </div>
        <div className="grid-error">No articles available</div>
      </div>
    );
  }

  // Ensure we have exactly 4 articles, fill with placeholders if needed
  const displayArticles = [...posts.slice(0, maxArticles)];

  while (displayArticles.length < 4) {
    const placeholderPost: EnhancedPost = {
      id: -displayArticles.length - 1,
      date: new Date().toISOString(),
      date_gmt: new Date().toISOString(),
      guid: {
        rendered: "#",
      },
      modified: new Date().toISOString(),
      modified_gmt: new Date().toISOString(),
      slug: `placeholder-${displayArticles.length}`,
      status: "publish" as const,
      type: "post",
      link: "#",
      title: { rendered: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing" },
      content: {
        rendered: "Lorem ipsum placeholder content...",
        protected: false,
      },
      excerpt: {
        rendered:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempordolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor....",
        protected: false,
      },
      author: 1,
      featured_media: 0,
      format: "standard" as const,
      meta: {},
      categories: [],
      tags: [],
      author_name: "Lastname",
      author_obj: null,
      featured_media_obj: null,
      categories_obj: [],
    };
    displayArticles.push(placeholderPost);
  }

  return (
    <div className="article-grid">
      {/* Category Title */}
      <div className="grid-header">
        <h2 className="grid-title">{categoryName || "Articles"}</h2>
      </div>

      {/* Articles Grid */}
      <div className="articles-container">
        {/* Top Row */}
        <div className="top-row">
          {/* Left */}
          <div className="grid-item">
            <ArticleCard
              article={displayArticles[0]}
              variant="standard"
              excerptLength={300}
              imagePosition="right"
              className="article-grid-card"
            />
          </div>

          {/* Right */}
          <div className="grid-item">
            <ArticleCard
              article={displayArticles[1]}
              variant="standard"
              excerptLength={300}
              imagePosition="right"
              className="article-grid-card"
            />
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="horizontal-divider"></div>

        {/* Bottom Row */}
        <div className="bottom-row">
          {/* Left */}
          <div className="grid-item">
            <ArticleCard
              article={displayArticles[2]}
              variant="standard"
              excerptLength={300}
              imagePosition="left"
              className="article-grid-card"
            />
          </div>

          {/* Right */}
          <div className="grid-item">
            <ArticleCard
              article={displayArticles[3]}
              variant="standard"
              excerptLength={300}
              imagePosition="left"
              className="article-grid-card"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleGrid;
