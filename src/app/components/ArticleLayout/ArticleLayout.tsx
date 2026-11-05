"use client";

import React, { useMemo } from "react";
import { EnhancedPost } from "../../lib/types";
import FourArticleGrid from "../FourArticleGrid/FourArticleGrid";
import { FeaturedArticle, SmallArticlePreview } from "../shared";
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
    const stacked = layout.columns.some(column => column.includes(id) && column.length < 4);
    return article && <div key={id} className="feature-side-slot" data-fit-id={id}>
      <SmallArticlePreview article={article} variant="preview-grid" imagePosition="left" className={`feature-side-card ${stacked ? "feature-side-card--stacked" : ""}`} showExcerpt={layout.overflow.includes(id)} excerptLength={300} />
    </div>;
  };
  return <div ref={rootRef} className={`article-layout feature-balanced-layout ${className}`}>
    <div className="section-header section-heading-rule">
      <h2 className="section-title">{categoryName || "Popular Articles"}</h2>
    </div>
    <div className="articles-container">
      <div className="featured-article-wrapper">
        <FeaturedArticle article={featured} imagePosition="top" variant="default" className="article-layout-featured feature-height-source" />
      </div>
      <div className={`feature-side-column article-layout-sidebar ${layout.columns[0].length < 4 ? "feature-side-column--stacked" : ""}`} data-side-column>{layout.columns[0].map(sideCard)}</div>
    </div>
    {layout.overflow.length > 0 && <div className="feature-side-overflow article-layout-overflow">{layout.overflow.map(sideCard)}</div>}
  </div>;
}
