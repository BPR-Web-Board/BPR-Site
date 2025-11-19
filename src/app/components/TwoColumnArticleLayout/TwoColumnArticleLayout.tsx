"use client";

import React from "react";
import Link from "next/link";
import { EnhancedPost } from "../../lib/types";
import {
  stripHtml,
  truncateText,
  getArticleTitle,
  getArticleLink,
} from "../../lib/utils";
import OptimizedImage from "../shared/OptimizedImage/OptimizedImage";
import FourArticleGrid from "../FourArticleGrid/FourArticleGrid";
import "./TwoColumnArticleLayout.css";

export interface TwoColumnArticleLayoutProps {
  leftColumnTitle?: string;
  leftColumnArticles: EnhancedPost[];
  rightColumnTitle?: string;
  rightColumnArticles: EnhancedPost[];
  className?: string;
  showMainArticle?: boolean;
  fallbackArticles?: EnhancedPost[]; // Articles to use when columns are uneven or empty
}

const TwoColumnArticleLayout: React.FC<TwoColumnArticleLayoutProps> = ({
  leftColumnTitle,
  leftColumnArticles,
  rightColumnTitle,
  rightColumnArticles,
  className = "",
  showMainArticle = true,
  fallbackArticles = [],
}) => {
  // Helper to get unique articles from fallback pool
  const getUniqueArticles = (
    existingArticles: EnhancedPost[],
    needed: number
  ): EnhancedPost[] => {
    const existingIds = new Set(existingArticles.map((a) => a.id));
    const unique: EnhancedPost[] = [];

    for (const article of fallbackArticles) {
      if (!existingIds.has(article.id) && unique.length < needed) {
        unique.push(article);
        existingIds.add(article.id);
      }
    }

    return unique;
  };

  // Normalize arrays to ensure both columns have equal length
  let normalizedLeftArticles = [...(leftColumnArticles || [])];
  let normalizedRightArticles = [...(rightColumnArticles || [])];

  const leftLength = normalizedLeftArticles.length;
  const rightLength = normalizedRightArticles.length;

  // If both columns are empty, show all available articles in FourArticleGrid
  if (leftLength === 0 && rightLength === 0) {
    const allAvailable = [...fallbackArticles];

    if (allAvailable.length === 0) {
      return <div className="tcal-empty">No articles available</div>;
    }

    return (
      <FourArticleGrid
        posts={allAvailable}
        categoryName={leftColumnTitle || rightColumnTitle}
        showCategoryTitle={!!(leftColumnTitle || rightColumnTitle)}
        numberOfRows={1}
        className={`width-constrained ${className}`}
      />
    );
  }

  // If one column is empty, fill it with fallback articles
  if (leftLength === 0 && rightLength > 0) {
    normalizedLeftArticles = getUniqueArticles(
      normalizedRightArticles,
      rightLength
    );
  } else if (rightLength === 0 && leftLength > 0) {
    normalizedRightArticles = getUniqueArticles(
      normalizedLeftArticles,
      leftLength
    );
  }

  // Equalize column lengths by padding shorter column with fallback articles
  const maxLength = Math.max(
    normalizedLeftArticles.length,
    normalizedRightArticles.length
  );

  if (normalizedLeftArticles.length < maxLength) {
    const needed = maxLength - normalizedLeftArticles.length;
    const fillArticles = getUniqueArticles(
      [...normalizedLeftArticles, ...normalizedRightArticles],
      needed
    );
    normalizedLeftArticles = [...normalizedLeftArticles, ...fillArticles];
  }

  if (normalizedRightArticles.length < maxLength) {
    const needed = maxLength - normalizedRightArticles.length;
    const fillArticles = getUniqueArticles(
      [...normalizedLeftArticles, ...normalizedRightArticles],
      needed
    );
    normalizedRightArticles = [...normalizedRightArticles, ...fillArticles];
  }

  // Calculate the final minimum length after equalization
  const minLength = Math.min(
    normalizedLeftArticles.length,
    normalizedRightArticles.length
  );

  // If still no articles after all attempts, show FourArticleGrid
  if (minLength === 0) {
    const allArticles = [
      ...normalizedLeftArticles,
      ...normalizedRightArticles,
      ...fallbackArticles,
    ].filter(
      (article, index, self) =>
        index === self.findIndex((a) => a.id === article.id)
    );

    if (allArticles.length === 0) {
      return <div className="tcal-empty">No articles available</div>;
    }

    return (
      <FourArticleGrid
        posts={allArticles}
        categoryName={leftColumnTitle || rightColumnTitle}
        showCategoryTitle={!!(leftColumnTitle || rightColumnTitle)}
        numberOfRows={1}
        className={`width-constrained ${className}`}
      />
    );
  }

  // Slice both arrays to minimum length to ensure equality
  normalizedLeftArticles = normalizedLeftArticles.slice(0, minLength);
  normalizedRightArticles = normalizedRightArticles.slice(0, minLength);

  const renderArticle = (
    article: EnhancedPost,
    isMainArticle: boolean = false
  ) => {
    const articleLink = getArticleLink(article);
    const title = getArticleTitle(article);
    const plainTitle = stripHtml(title);
    const excerpt = truncateText(
      stripHtml(article?.excerpt?.rendered || ""),
      isMainArticle ? 200 : 100
    );

    if (isMainArticle) {
      return (
        <article key={article.id} className="tcal-main-article">
          <Link href={articleLink} style={{ display: "contents" }}>
            <div className="tcal-main-image-container">
              {article?.featured_media_obj?.source_url ? (
                <OptimizedImage
                  src={article.featured_media_obj.source_url}
                  alt={stripHtml(title)}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="tcal-main-image"
                  showPlaceholder={true}
                />
              ) : (
                <div className="tcal-main-image-placeholder"></div>
              )}
            </div>
            <div className="tcal-main-content">
              <h2
                className="tcal-main-title"
                dangerouslySetInnerHTML={{ __html: title }}
              ></h2>
              <div
                className="tcal-main-excerpt"
                dangerouslySetInnerHTML={{ __html: excerpt }}
              ></div>
              <div className="tcal-main-meta">
                <span className="tcal-main-author">
                  {(article?.author_name || "LASTNAME").toUpperCase()}
                </span>
              </div>
            </div>
          </Link>
        </article>
      );
    }

    const secondaryTitle = truncateText(plainTitle, 90);

    return (
      <article key={article.id} className="tcal-secondary-article">
        <Link href={articleLink} style={{ display: "contents" }}>
          <h3
            className="tcal-secondary-title"
            dangerouslySetInnerHTML={{ __html: secondaryTitle }}
          ></h3>
          <div
            className="tcal-secondary-excerpt"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          ></div>
          <div className="tcal-secondary-meta">
            <span className="tcal-secondary-author">
              {(article?.author_name || "LASTNAME").toUpperCase()}
            </span>
          </div>
          {article?.featured_media_obj?.source_url && (
            <div className="tcal-secondary-image-container">
              <OptimizedImage
                src={article.featured_media_obj.source_url}
                alt={stripHtml(title)}
                fill
                sizes="(max-width: 768px) 100vw, 20vw"
                className="tcal-secondary-image"
                showPlaceholder={true}
              />
            </div>
          )}
        </Link>
      </article>
    );
  };

  return (
    <div className={`two-column-article-layout ${className}`}>
      {/* Left Column */}
      <div className="tcal-column tcal-left-column">
        {leftColumnTitle && (
          <h1 className="tcal-column-title">{leftColumnTitle}</h1>
        )}
        <div className="tcal-column-content">
          {normalizedLeftArticles && normalizedLeftArticles.length > 0 && (
            <>
              {showMainArticle ? (
                <>
                  {renderArticle(normalizedLeftArticles[0], true)}
                  {normalizedLeftArticles.length > 1 && (
                    <div
                      className="tcal-article-divider"
                      aria-hidden="true"
                    ></div>
                  )}
                  <div className="tcal-secondary-articles">
                    {normalizedLeftArticles
                      .slice(1, 4)
                      .map((article) => renderArticle(article, false))}
                  </div>
                </>
              ) : (
                <div className="tcal-secondary-articles">
                  {normalizedLeftArticles
                    .slice(0, 4)
                    .map((article) => renderArticle(article, false))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="tcal-column tcal-right-column">
        {rightColumnTitle && (
          <h1 className="tcal-column-title">{rightColumnTitle}</h1>
        )}
        <div className="tcal-column-content">
          {normalizedRightArticles && normalizedRightArticles.length > 0 && (
            <>
              {showMainArticle ? (
                <>
                  {renderArticle(normalizedRightArticles[0], true)}
                  {normalizedRightArticles.length > 1 && (
                    <div
                      className="tcal-article-divider"
                      aria-hidden="true"
                    ></div>
                  )}
                  <div className="tcal-secondary-articles">
                    {normalizedRightArticles
                      .slice(1, 4)
                      .map((article) => renderArticle(article, false))}
                  </div>
                </>
              ) : (
                <div className="tcal-secondary-articles">
                  {normalizedRightArticles
                    .slice(0, 4)
                    .map((article) => renderArticle(article, false))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoColumnArticleLayout;
