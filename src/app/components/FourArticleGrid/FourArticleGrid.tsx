import React from "react";
import { EnhancedPost } from "../../lib/types";
import { stripHtml } from "../../lib/utils";
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

function GridCard({
  article,
  imageSizes,
  imagePosition = "top",
}: {
  article: EnhancedPost;
  imageSizes?: string;
  imagePosition?: "top" | "left" | "right";
}) {
  return (
    <ArticleCard
      article={article}
      excerptLength={200}
      showExcerpt
      imagePosition={imagePosition}
      imageSizes={imageSizes}
      className={imagePosition === "left" || imagePosition === "right" ? "four-article-grid-horizontal" : undefined}
    />
  );
}

export default function FourArticleGrid({ posts, categoryName, showCategoryTitle = true,
  numberOfRows = 1, columns = 4, className = "" }: FourArticleGridProps) {
  const articles = (posts || []).slice(0, Math.max(0, Math.floor(numberOfRows)) * columns);
  if (!articles.length) return null;
  const imageSizes = columns <= 2
    ? "(max-width: 768px) 100vw, 50vw"
    : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw";
  return <section className={`four-article-grid columns-${columns} ${className}`}>
    {showCategoryTitle && categoryName && <h2 className="category-title section-heading-rule">{stripHtml(categoryName)}</h2>}
    <div className="articles-grid-container">
      <div className="articles-rows-container">
        {Array.from({ length: Math.ceil(articles.length / columns) }, (_, row) => {
          const rowArticles = articles.slice(row * columns, (row + 1) * columns);
          const orphanHorizontal = rowArticles.length === 1;
          return (
            <div key={row} className={`articles-grid count-${rowArticles.length}${orphanHorizontal ? " count-1-horizontal" : ""}`}>
              {rowArticles.map((article) => (
                <GridCard
                  key={article.id}
                  article={article}
                  imageSizes={orphanHorizontal ? "(max-width: 768px) 100vw, 40vw" : imageSizes}
                  imagePosition={orphanHorizontal ? "left" : "top"}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  </section>;
}
