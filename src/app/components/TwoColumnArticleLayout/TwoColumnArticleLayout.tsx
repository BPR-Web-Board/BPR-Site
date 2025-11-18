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
import "./TwoColumnArticleLayout.css";

export interface TwoColumnArticleLayoutProps {
  leftColumnTitle?: string;
  leftColumnArticles: EnhancedPost[];
  rightColumnTitle?: string;
  rightColumnArticles: EnhancedPost[];
  className?: string;
}

const TwoColumnArticleLayout: React.FC<TwoColumnArticleLayoutProps> = ({
  leftColumnTitle,
  leftColumnArticles,
  rightColumnTitle,
  rightColumnArticles,
  className = "",
}) => {
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
            <Link href={articleLink} className="tcal-main-title-link">
              <h2
                className="tcal-main-title"
                dangerouslySetInnerHTML={{ __html: title }}
              ></h2>
            </Link>
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
        </article>
      );
    }

    const secondaryTitle = truncateText(plainTitle, 90);

    return (
      <article key={article.id} className="tcal-secondary-article">
        <Link href={articleLink} className="tcal-secondary-title-link">
          <h3
            className="tcal-secondary-title"
            dangerouslySetInnerHTML={{ __html: secondaryTitle }}
          ></h3>
        </Link>
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
      </article>
    );
  };

  if (
    (!leftColumnArticles || leftColumnArticles.length === 0) &&
    (!rightColumnArticles || rightColumnArticles.length === 0)
  ) {
    return <div className="tcal-empty">No articles available</div>;
  }

  return (
    <div className={`two-column-article-layout ${className}`}>
      {/* Left Column */}
      <div className="tcal-column tcal-left-column">
        {leftColumnTitle && (
          <h1 className="tcal-column-title">{leftColumnTitle}</h1>
        )}
        <div className="tcal-column-content">
          {leftColumnArticles && leftColumnArticles.length > 0 && (
            <>
              {renderArticle(leftColumnArticles[0], true)}
              {leftColumnArticles.length > 1 && (
                <div className="tcal-article-divider" aria-hidden="true"></div>
              )}
              <div className="tcal-secondary-articles">
                {leftColumnArticles
                  .slice(1, 4)
                  .map((article) => renderArticle(article, false))}
              </div>
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
          {rightColumnArticles && rightColumnArticles.length > 0 && (
            <>
              {renderArticle(rightColumnArticles[0], true)}
              {rightColumnArticles.length > 1 && (
                <div className="tcal-article-divider" aria-hidden="true"></div>
              )}
              <div className="tcal-secondary-articles">
                {rightColumnArticles
                  .slice(1, 4)
                  .map((article) => renderArticle(article, false))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoColumnArticleLayout;
