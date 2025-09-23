"use client";

import React from "react";
import { EnhancedPost } from "../../lib/types";
import { ArticleCard } from "../shared";
import "./FourArticleGrid.css";

interface FourArticleGridProps {
  posts: EnhancedPost[];
  categoryName?: string; // Optional: display name for the category
  showCategoryTitle?: boolean;
  showBoundingLines?: boolean; // Optional: show grey bounding lines around articles
  numberOfRows?: number; // Number of rows to display (each row has 4 articles)
  className?: string;
}

const FourArticleGrid: React.FC<FourArticleGridProps> = ({
  posts,
  categoryName,
  showCategoryTitle = true,
  showBoundingLines = false,
  numberOfRows = 1,
  className = "",
}) => {
  if (!posts || posts.length === 0) {
    return (
      <div className={`four-article-grid ${className}`}>
        {showCategoryTitle && categoryName && (
          <h2 className="category-title">{categoryName}</h2>
        )}
        <div className="error-state">No articles available</div>
      </div>
    );
  }

  // Calculate total articles needed (numberOfRows * 4)
  const totalArticlesNeeded = numberOfRows * 4;

  // Take only the required number of posts (or however many are available)
  const displayArticles = posts.slice(0, totalArticlesNeeded);

  // Fill with placeholders if we have fewer articles than needed
  while (displayArticles.length < totalArticlesNeeded) {
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
    <div className={`four-article-grid ${className}`}>
      {showCategoryTitle && categoryName && (
        <h2 className="category-title">{categoryName}</h2>
      )}

      <div
        className={`articles-grid-container ${
          showBoundingLines ? "with-bounding-lines" : ""
        }`}
      >
        {showBoundingLines && (
          <>
            {/* Horizontal top line */}
            <div className="bounding-line horizontal top" />

            {/* Vertical lines */}
            {/* <div className="bounding-line vertical left" /> */}
            <div className="bounding-line vertical middle-1" />
            <div className="bounding-line vertical middle-2" />
            <div className="bounding-line vertical middle-3" />
            {/* <div className="bounding-line vertical right" /> */}

            {/* Horizontal bottom line */}
            <div className="bounding-line horizontal bottom" />
          </>
        )}

        <div className="articles-rows-container">
          {Array.from({ length: numberOfRows }, (_, rowIndex) => {
            const startIndex = rowIndex * 4;
            const endIndex = startIndex + 4;
            const rowArticles = displayArticles.slice(startIndex, endIndex);

            return (
              <div key={rowIndex}>
                {/* Add horizontal divider before each row except the first */}
                {rowIndex > 0 && <div className="row-divider" />}

                <div className="articles-grid">
                  {rowArticles.map((article, index) => (
                    <ArticleCard
                      key={`${article.id}-${startIndex + index}`}
                      article={article}
                      variant="standard"
                      excerptLength={200}
                      imagePosition="top"
                      className="four-article-grid-card"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FourArticleGrid;
