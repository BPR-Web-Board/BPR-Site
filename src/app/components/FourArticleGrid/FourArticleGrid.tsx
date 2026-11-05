import React from "react";
import { EnhancedPost } from "../../lib/types";
import { ArticleCard } from "../shared";
import "./FourArticleGrid.css";

interface FourArticleGridProps {
  posts: EnhancedPost[];
  categoryName?: string;
  showCategoryTitle?: boolean;
  showBoundingLines?: boolean;
  numberOfRows?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}

export default function FourArticleGrid({ posts, categoryName, showCategoryTitle = true,
  numberOfRows = 1, columns = 4, className = "" }: FourArticleGridProps) {
  const articles = (posts || []).slice(0, Math.max(0, Math.floor(numberOfRows)) * columns);
  if (!articles.length) return null;
  return <section className={`four-article-grid ${className}`}>
    {showCategoryTitle && categoryName && <h2 className="category-title section-heading-rule">{categoryName}</h2>}
    <div className="articles-grid-container">
      <div className="articles-rows-container">
        {Array.from({ length: Math.ceil(articles.length / columns) }, (_, row) => {
          const rowArticles = articles.slice(row * columns, (row + 1) * columns);
          return <div key={row} className={`articles-grid count-${rowArticles.length}`}>
            {rowArticles.map(article => <ArticleCard key={article.id} article={article}
              excerptLength={rowArticles.length === 1 ? 500 : 200} showExcerpt
              imagePosition={rowArticles.length === 1 ? "left" : "top"} />)}
          </div>;
        })}
      </div>
    </div>
  </section>;
}
