"use client";

import React, { useMemo } from "react";
import { EnhancedPost } from "../../lib/types";
import { stripHtml } from "../../lib/utils";
import FourArticleGrid from "../FourArticleGrid/FourArticleGrid";
import FeaturedArticle from "../shared/FeaturedArticle";
import { ArticleCard } from "../shared";
import SmallArticlePreview from "../shared/SmallArticlePreview";
import useFeatureFit from "../shared/FeatureBalancedLayout/useFeatureFit";
import { getMediaPreview } from "../../lib/mediaPreview";
import "../shared/FeatureBalancedLayout/FeatureBalancedLayout.css";
import "./ArticlePreviewGrid.css";

export interface ArticlePreviewGridProps {
  articles: EnhancedPost[];
  categoryName?: string;
  className?: string;
}

const SIDE_PER_COLUMN = 4;
const SIDE_PER_COLUMN_WITH_IMAGES = 2;

function hasSideImage(article: EnhancedPost): boolean {
  return Boolean(article.featured_media_obj?.source_url || getMediaPreview(article)?.thumbnail);
}

export default function ArticlePreviewGrid({ articles, categoryName, className = "" }: ArticlePreviewGridProps) {
  const unique = useMemo(() => Array.from(new Map((articles || []).map(article => [article.id, article])).values()), [articles]);
  const featured = unique[2]?.featured_media_obj?.source_url ? unique[2] : unique.find(article => article.featured_media_obj?.source_url);
  const candidates = unique.filter(article => article.id !== featured?.id);
  const imageSidePool = candidates.slice(0, SIDE_PER_COLUMN * 2);
  // Image cards are tall — if every side slot would have a picture, keep at most 2 per column.
  const sidePerColumn =
    imageSidePool.length > 0 && imageSidePool.every(hasSideImage)
      ? SIDE_PER_COLUMN_WITH_IMAGES
      : SIDE_PER_COLUMN;
  const sidePool = candidates.slice(0, sidePerColumn * 2);
  const { rootRef, layout } = useFeatureFit(sidePool.map(article => article.id), 2, 1024, unique);
  if (!unique.length) return null;
  if (unique.length < 5 || !featured) {
    return (
      <FourArticleGrid
        posts={unique}
        categoryName={categoryName}
        showCategoryTitle={Boolean(categoryName)}
        numberOfRows={Math.ceil(unique.length / 4)}
        className={`width-constrained ${className}`}
      />
    );
  }

  const belowBreakpoint = sidePool.length > 0 && layout.columns.every(column => column.length === 0);
  const leftArticles = belowBreakpoint ? [] : sidePool.filter((_, index) => index % 2 === 0);
  const rightArticles = belowBreakpoint ? [] : sidePool.filter((_, index) => index % 2 === 1);
  const overflowArticles = belowBreakpoint ? candidates : candidates.slice(sidePerColumn * 2);
  const leftStacked = leftArticles.length > 0;
  const rightStacked = rightArticles.length > 0;

  const sideCard = (article: EnhancedPost, { stacked = false, showExcerpt = false }: { stacked?: boolean; showExcerpt?: boolean } = {}) => {
    const hasImage = Boolean(article.featured_media_obj?.source_url || getMediaPreview(article));
    return (
      <div key={article.id} className={`feature-side-slot${hasImage ? " feature-side-slot--with-image" : ""}`} data-fit-id={article.id}>
        <SmallArticlePreview
          article={article}
          variant="preview-grid"
          imagePosition="top"
          className={`feature-side-card${stacked ? " feature-side-card--stacked" : ""}`}
          showExcerpt={showExcerpt}
          excerptLength={140}
        />
      </div>
    );
  };

  const overflowCard = (article: EnhancedPost, { horizontal = false }: { horizontal?: boolean } = {}) => {
    if (horizontal) {
      return (
        <ArticleCard
          key={article.id}
          article={article}
          excerptLength={220}
          showExcerpt
          imagePosition="left"
          className="four-article-grid-horizontal"
        />
      );
    }
    return sideCard(article, { showExcerpt: true });
  };

  const grid = (
    <div ref={rootRef} className={`article-preview-grid feature-balanced-layout ${className}`}>
      <div className={`feature-side-column apg-left-column${leftStacked ? " feature-side-column--stacked" : ""}`} data-side-column>
        {leftArticles.map(article => sideCard(article, { stacked: leftStacked }))}
      </div>
      <div className="apg-center-column">
        <FeaturedArticle article={featured} variant="preview-grid" imagePosition="top" className="apg-featured-article feature-height-source" excerptLength={180} />
      </div>
      <div className={`feature-side-column apg-right-column${rightStacked ? " feature-side-column--stacked" : ""}`} data-side-column>
        {rightArticles.map(article => sideCard(article, { stacked: rightStacked }))}
      </div>
      {overflowArticles.length > 0 && Array.from(
        { length: Math.ceil(overflowArticles.length / 4) },
        (_, row) => {
          const chunk = overflowArticles.slice(row * 4, row * 4 + 4);
          const orphanHorizontal = chunk.length === 1;
          return (
            <div
              key={`overflow-${row}`}
              className={`feature-side-overflow apg-overflow${orphanHorizontal ? " feature-side-overflow--horizontal" : ""}`}
            >
              {chunk.map(article => overflowCard(article, { horizontal: orphanHorizontal }))}
            </div>
          );
        }
      )}
    </div>
  );

  if (!categoryName) return grid;

  return (
    <section className="article-preview-grid-section">
      <h2 className="category-title section-heading-rule">{stripHtml(categoryName)}</h2>
      {grid}
    </section>
  );
}
