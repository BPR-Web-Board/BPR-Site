"use client";

import React, { useMemo } from "react";
import { EnhancedPost } from "../../lib/types";
import FourArticleGrid from "../FourArticleGrid/FourArticleGrid";
import FeaturedArticle from "../shared/FeaturedArticle";
import LargeArticlePreview from "../shared/LargeArticlePreview/LargeArticlePreview";
import SmallArticlePreview from "../shared/SmallArticlePreview";
import useFeatureFit from "../shared/FeatureBalancedLayout/useFeatureFit";
import { getMediaPreview } from "../../lib/mediaPreview";
import "../shared/FeatureBalancedLayout/FeatureBalancedLayout.css";
import "./ArticlePreviewGrid.css";

export interface ArticlePreviewGridProps {
  articles: EnhancedPost[];
  className?: string;
}

export default function ArticlePreviewGrid({ articles, className = "" }: ArticlePreviewGridProps) {
  const unique = useMemo(() => Array.from(new Map((articles || []).map(article => [article.id, article])).values()), [articles]);
  const featured = unique[2]?.featured_media_obj?.source_url ? unique[2] : unique.find(article => article.featured_media_obj?.source_url);
  const candidates = unique.filter(article => article.id !== featured?.id);
  const { rootRef, layout } = useFeatureFit(candidates.map(article => article.id), 2, 1024, unique);
  if (!unique.length) return null;
  if (unique.length < 5 || !featured) {
    return <FourArticleGrid posts={unique} numberOfRows={Math.ceil(unique.length / 4)} showCategoryTitle={false} className={`width-constrained ${className}`} />;
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
  return <div ref={rootRef} className={`article-preview-grid feature-balanced-layout ${className}`}>
    <div className={`feature-side-column apg-left-column ${layout.columns[0].length < 4 ? "feature-side-column--stacked" : ""}`} data-side-column>{layout.columns[0].map(sideCard)}</div>
    <div className="apg-center-column">
      <FeaturedArticle article={featured} variant="preview-grid" imagePosition="top" className="apg-featured-article feature-height-source" />
    </div>
    <div className={`feature-side-column apg-right-column ${layout.columns[1].length < 4 ? "feature-side-column--stacked" : ""}`} data-side-column>{layout.columns[1].map(sideCard)}</div>
    {layout.overflow.length > 0 && <div className="feature-side-overflow apg-overflow">{layout.overflow.map(overflowCard)}</div>}
  </div>;
}
