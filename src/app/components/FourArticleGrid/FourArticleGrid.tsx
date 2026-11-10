import React from "react";
import { EnhancedPost } from "../../lib/types";
import { stripHtml } from "../../lib/utils";
import { ArticleCard } from "../shared";
import LargeArticlePreview from "../shared/LargeArticlePreview/LargeArticlePreview";
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

function GridCard({ article }: { article: EnhancedPost }) {
  return (
    <ArticleCard
      article={article}
      excerptLength={200}
      showExcerpt
      imagePosition="top"
    />
  );
}

function SoloPreview({ article }: { article: EnhancedPost }) {
  return (
    <LargeArticlePreview
      article={article}
      excerptLength={220}
      imagePosition="left"
      className="four-article-grid-solo"
    />
  );
}

export default function FourArticleGrid({ posts, categoryName, showCategoryTitle = true,
  numberOfRows = 1, columns = 4, className = "" }: FourArticleGridProps) {
  const articles = (posts || []).slice(0, Math.max(0, Math.floor(numberOfRows)) * columns);
  if (!articles.length) return null;
  return <section className={`four-article-grid ${className}`}>
    {showCategoryTitle && categoryName && <h2 className="category-title section-heading-rule">{stripHtml(categoryName)}</h2>}
    <div className="articles-grid-container">
      <div className="articles-rows-container">
        {Array.from({ length: Math.ceil(articles.length / columns) }, (_, row) => {
          const rowArticles = articles.slice(row * columns, (row + 1) * columns);
          // On mid widths the grid is 2 columns, so a 3-card row leaves a hole.
          // Split into a pair + horizontal leftover instead.
          if (rowArticles.length === 3) {
            return (
              <React.Fragment key={row}>
                <div className="articles-grid count-2">
                  {rowArticles.slice(0, 2).map((article) => (
                    <GridCard key={article.id} article={article} />
                  ))}
                </div>
                <div className="articles-grid count-1">
                  <SoloPreview article={rowArticles[2]} />
                </div>
              </React.Fragment>
            );
          }
          return (
            <div key={row} className={`articles-grid count-${rowArticles.length}`}>
              {rowArticles.map((article) =>
                rowArticles.length === 1 ? (
                  <SoloPreview key={article.id} article={article} />
                ) : (
                  <GridCard key={article.id} article={article} />
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  </section>;
}
