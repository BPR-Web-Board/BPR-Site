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
