"use client";

import React from "react";
import Link from "next/link";
import { EnhancedPost } from "../../lib/types";
import {
  formatDate,
  stripHtml,
  truncateText,
  getArticleTitle,
  getArticleLink,
} from "../../lib/utils";
import OptimizedImage from "../shared/OptimizedImage/OptimizedImage";
import "./ArticleSplitShowcase.css";

export interface ArticleSplitShowcaseProps {
  posts: EnhancedPost[];
  sectionTitle?: string;
  highlightIndex?: number;
  maxSecondary?: number;
  mainPlacement?: "left" | "right";
  mainTitleLength?: number;
  mainExcerptLength?: number;
  mainAuthorLength?: number;
  secondaryTitleLength?: number;
  secondaryAuthorLength?: number;
  className?: string;
}

const ArticleSplitShowcase: React.FC<ArticleSplitShowcaseProps> = ({
  posts,
  sectionTitle,
  highlightIndex = 0,
  maxSecondary = 6,
  mainPlacement = "left",
  mainTitleLength = 160,
  mainExcerptLength = 350,
  mainAuthorLength = 42,
  secondaryTitleLength = 90,
  secondaryAuthorLength = 42,
  className = "",
}) => {
  if (!posts || posts.length === 0) {
    return (
      <div className={`article-split-showcase ${className}`}>
        <div className="article-split-empty">No articles available</div>
      </div>
    );
  }

  const boundedHighlight = Math.min(
    Math.max(highlightIndex, 0),
    posts.length - 1
  );
  const mainArticle = posts[boundedHighlight];
  const secondaryArticles = posts
    .filter((_, index) => index !== boundedHighlight)
    .slice(0, maxSecondary);

  const renderMainArticle = () => {
    if (!mainArticle) {
      return null;
    }

    const mainTitle = truncateText(
      stripHtml(getArticleTitle(mainArticle)),
      mainTitleLength
    );
    const mainExcerpt = truncateText(
      stripHtml(mainArticle?.excerpt?.rendered || ""),
      mainExcerptLength
    );
    const mainAuthor = truncateText(
      (mainArticle?.author_name || "LASTNAME").toUpperCase(),
      mainAuthorLength
    );
    const mainDate = mainArticle?.date
      ? formatDate(mainArticle.date).toUpperCase()
      : "";
    const articleLink = getArticleLink(mainArticle);

    return (
      <article className="article-split-main-article">
        <div className="article-split-main-content">
          <div className="article-split-title-meta-container">
            <Link href={articleLink} className="article-split-main-title-link">
              <h2
                className="article-split-main-title"
                dangerouslySetInnerHTML={{ __html: mainTitle }}
              />
            </Link>
            <div className="article-split-main-meta">
              <span className="article-split-main-author">BY {mainAuthor}</span>
              {mainDate && (
                <>
                  <span className="article-split-meta-divider" />
                  <span className="article-split-main-date">{mainDate}</span>
                </>
              )}
            </div>
          </div>
          <div
            className="article-split-main-excerpt"
            dangerouslySetInnerHTML={{ __html: mainExcerpt }}
          />
        </div>
        <div className="article-split-main-image-wrapper">
          {mainArticle?.featured_media_obj?.source_url ? (
            <OptimizedImage
              src={mainArticle.featured_media_obj.source_url}
              alt={stripHtml(mainTitle)}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 45vw"
              className="article-split-main-image"
              priority
              showPlaceholder={true}
            />
          ) : (
            <div className="article-split-main-image-placeholder">
              <span>Image not available</span>
            </div>
          )}
        </div>
      </article>
    );
  };

  const renderSecondaryArticles = () => {
    if (!secondaryArticles || secondaryArticles.length === 0) {
      return (
        <div className="article-split-secondary-empty">
          Additional articles unavailable
        </div>
      );
    }

    return (
      <div className="article-split-secondary-grid">
        {secondaryArticles.map((article) => {
          const articleTitle = truncateText(
            stripHtml(getArticleTitle(article)),
            secondaryTitleLength
          );
          const authorName = truncateText(
            (article?.author_name || "LASTNAME").toUpperCase(),
            secondaryAuthorLength
          );
          const articleDate = article?.date
            ? formatDate(article.date).toUpperCase()
            : "";
          const articleLink = getArticleLink(article);

          return (
            <article key={article.id} className="article-split-secondary-item">
              <div className="article-split-secondary-header">
                {articleDate && (
                  <span className="article-split-secondary-date">
                    {articleDate}
                  </span>
                )}
              </div>

              <Link
                href={articleLink}
                className="article-split-secondary-title-link"
              >
                <h3
                  className="article-split-secondary-title"
                  dangerouslySetInnerHTML={{ __html: articleTitle }}
                ></h3>
              </Link>
              <div className="article-split-secondary-author">
                BY {authorName}
              </div>
              <div className="article-split-secondary-divider" />
            </article>
          );
        })}
      </div>
    );
  };

  const mainColumn = (
    <div className="article-split-main">{renderMainArticle()}</div>
  );
  const secondaryColumn = (
    <div className="article-split-secondary">{renderSecondaryArticles()}</div>
  );

  return (
    <section
      className={`article-split-showcase placement-${mainPlacement} ${className}`}
    >
      {sectionTitle && (
        <header className="article-split-header">
          <h2 className="article-split-section-title">{sectionTitle}</h2>
        </header>
      )}

      <div className="article-split-grid">
        {mainPlacement === "left" ? (
          <>
            {mainColumn}
            {secondaryColumn}
          </>
        ) : (
          <>
            {secondaryColumn}
            {mainColumn}
          </>
        )}
      </div>
    </section>
  );
};

export default ArticleSplitShowcase;
