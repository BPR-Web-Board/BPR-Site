"use client";

import React, { useMemo } from "react";
import { EnhancedPost } from "../../lib/types";
import { getMediaPreview } from "../../lib/mediaPreview";
import { stripHtml } from "../../lib/utils";
import FourArticleGrid from "../FourArticleGrid/FourArticleGrid";
import { FeaturedArticle, SmallArticlePreview } from "../shared";
import LargeArticlePreview from "../shared/LargeArticlePreview/LargeArticlePreview";
import useFeatureFit from "../shared/FeatureBalancedLayout/useFeatureFit";
import "../shared/FeatureBalancedLayout/FeatureBalancedLayout.css";
import "./ArticleLayout.css";

interface ArticleLayoutProps {
  posts: EnhancedPost[];
  categoryName?: string;
  className?: string;
}

export default function ArticleLayout({ posts, categoryName, className = "" }: ArticleLayoutProps) {
  const unique = useMemo(() => Array.from(new Map((posts || []).map(post => [post.id, post])).values()), [posts]);
  const featured = unique[0];
  const candidates = unique.slice(1);
  const { rootRef, layout } = useFeatureFit(candidates.map(article => article.id), 1, 768, unique);
  if (!unique.length) return null;
  if (unique.length < 3) {
    return <FourArticleGrid posts={unique} categoryName={categoryName || "Popular Articles"} className={`width-constrained ${className}`} />;
  }
  const byId = new Map(candidates.map(article => [article.id, article]));
  const sideCard = (id: number) => {
    const article = byId.get(id);
    if (!article) return null;
    const stacked = layout.columns.some(column => column.includes(id) && column.length < 4);
    const hasImage = Boolean(article.featured_media_obj?.source_url || getMediaPreview(article));
    return <div key={id} className={`feature-side-slot${hasImage ? " feature-side-slot--with-image" : ""}`} data-fit-id={id}>
      <SmallArticlePreview article={article} variant="preview-grid" imagePosition="top" className={`feature-side-card ${stacked ? "feature-side-card--stacked" : ""}`} showExcerpt={layout.overflow.includes(id)} excerptLength={300} />
    </div>;
  };
  const overflowCard = (id: number) => {
    const article = byId.get(id);
    if (!article) return null;
    if (layout.overflow.length === 1) {
      return <div key={id} className="feature-side-slot feature-side-slot--with-image" data-fit-id={id}>
        <LargeArticlePreview article={article} excerptLength={220} imagePosition="left" className="feature-side-card four-article-grid-solo" />
      </div>;
    }
    return sideCard(id);
  };
  return <div ref={rootRef} className={`article-layout feature-balanced-layout ${className}`}>
    <div className="section-header section-heading-rule">
      <h2 className="section-title">{stripHtml(categoryName || "Popular Articles")}</h2>
    </div>
    <div className="articles-container">
      <div className="featured-article-wrapper">
        <FeaturedArticle article={featured} imagePosition="top" variant="default" className="article-layout-featured feature-height-source" />
      </div>
      <div className={`feature-side-column article-layout-sidebar ${layout.columns[0].length < 4 ? "feature-side-column--stacked" : ""}`} data-side-column>{layout.columns[0].map(sideCard)}</div>
    </div>
    {layout.overflow.length > 0 && <div className="feature-side-overflow article-layout-overflow">{layout.overflow.map(overflowCard)}</div>}
  </div>;
}
