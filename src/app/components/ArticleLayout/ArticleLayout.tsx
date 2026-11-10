"use client";

import React, { useMemo } from "react";
import { EnhancedPost } from "../../lib/types";
import { getMediaPreview } from "../../lib/mediaPreview";
import { stripHtml } from "../../lib/utils";
import FourArticleGrid from "../FourArticleGrid/FourArticleGrid";
import { FeaturedArticle, SmallArticlePreview } from "../shared";
import useFeatureFit from "../shared/FeatureBalancedLayout/useFeatureFit";
import "../shared/FeatureBalancedLayout/FeatureBalancedLayout.css";
import "./ArticleLayout.css";

interface ArticleLayoutProps {
  posts: EnhancedPost[];
  categoryName?: string;
  className?: string;
  showCategoryTitle?: boolean;
}

const SIDE_COUNT = 2;

export default function ArticleLayout({
  posts,
  categoryName,
  className = "",
  showCategoryTitle = true,
}: ArticleLayoutProps) {
  const unique = useMemo(
    () => Array.from(new Map((posts || []).map((post) => [post.id, post])).values()),
    [posts]
  );
  const featured =
    unique.find(
      (post) =>
        post.featured_media_obj?.source_url || getMediaPreview(post)?.thumbnail
    ) || unique[0];
  const candidates = unique.filter((post) => post.id !== featured?.id);
  const sidePool = candidates.slice(0, SIDE_COUNT);
  const overflowPool = candidates.slice(SIDE_COUNT);
  const { rootRef, layout } = useFeatureFit(
    sidePool.map((article) => article.id),
    1,
    768,
    unique
  );
  if (!unique.length) return null;
  if (unique.length < 3 || !featured) {
    return (
      <FourArticleGrid
        posts={unique}
        categoryName={categoryName || "Popular Articles"}
        showCategoryTitle={showCategoryTitle}
        className={`width-constrained ${className}`}
      />
    );
  }

  const belowBreakpoint =
    sidePool.length > 0 && layout.columns[0].length === 0;
  const sideArticles = belowBreakpoint ? [] : sidePool;
  const overflowArticles = belowBreakpoint ? candidates : overflowPool;
  const sideStacked = sideArticles.length > 0;

  const sideCard = (
    article: EnhancedPost,
    { stacked = false }: { stacked?: boolean } = {}
  ) => {
    const hasImage = Boolean(
      article.featured_media_obj?.source_url || getMediaPreview(article)
    );
    return (
      <div
        key={article.id}
        className={`feature-side-slot${hasImage ? " feature-side-slot--with-image" : ""}`}
        data-fit-id={article.id}
      >
        <SmallArticlePreview
          article={article}
          variant="preview-grid"
          imagePosition="top"
          className={`feature-side-card${stacked ? " feature-side-card--stacked" : ""}`}
          showExcerpt={false}
          excerptLength={140}
        />
      </div>
    );
  };

  return (
    <div
      ref={rootRef}
      className={`article-layout feature-balanced-layout ${showCategoryTitle ? "" : "article-layout--no-title"} ${className}`}
    >
      {showCategoryTitle && (
        <div className="section-header section-heading-rule">
          <h2 className="section-title">
            {stripHtml(categoryName || "Popular Articles")}
          </h2>
        </div>
      )}
      <div className="articles-container">
        <div className="featured-article-wrapper">
          <FeaturedArticle
            article={featured}
            imagePosition="top"
            variant="default"
            className="article-layout-featured feature-height-source"
            excerptLength={180}
          />
        </div>
        <div
          className={`feature-side-column article-layout-sidebar${sideStacked ? " feature-side-column--stacked" : ""}`}
          data-side-column
        >
          {sideArticles.map((article) =>
            sideCard(article, { stacked: sideStacked })
          )}
        </div>
      </div>
      {overflowArticles.length > 0 && (
        <FourArticleGrid
          posts={overflowArticles}
          showCategoryTitle={false}
          numberOfRows={Math.ceil(overflowArticles.length / 4)}
          className="section-overflow article-layout-overflow"
        />
      )}
    </div>
  );
}
