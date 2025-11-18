"use client";

import React from "react";
import Link from "next/link";
import { EnhancedPost } from "../../../lib/types";
import {
  stripHtml,
  truncateText,
  getArticleTitle,
  getArticleLink,
} from "../../../lib/utils";
import OptimizedImage from "../OptimizedImage/OptimizedImage";
import "./ArticleCard.css";

export interface ArticleCardProps {
  article: EnhancedPost;
  variant?: "standard" | "compact" | "featured";
  showExcerpt?: boolean;
  excerptLength?: number;
  showImage?: boolean;
  imagePosition?: "left" | "right" | "top";
  className?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = "standard",
  showExcerpt = true,
  excerptLength = 200,
  showImage = true,
  imagePosition = "top",
  className = "",
}) => {
  const articleLink = getArticleLink(article);
  const title = getArticleTitle(article);
  const excerpt = truncateText(
    stripHtml(article?.excerpt?.rendered || ""),
    excerptLength
  );

  const imageContent = showImage && (
    <div className={`article-card-image-container image-${imagePosition}`}>
      {article?.featured_media_obj?.source_url ? (
        <OptimizedImage
          src={article.featured_media_obj.source_url}
          alt={stripHtml(title)}
          fill
          className="article-card-image"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          showPlaceholder={true}
        />
      ) : (
        <div className="article-card-image-placeholder"></div>
      )}
    </div>
  );

  const textContent = (
    <div className="article-card-content">
      <Link href={articleLink} className="article-card-title-link">
        <h3
          className={`article-card-title variant-${variant}`}
          dangerouslySetInnerHTML={{ __html: title }}
        ></h3>
      </Link>

      <div className="article-card-meta">
        <span className="article-card-author">
          BY {(article?.author_name || "LASTNAME").toUpperCase()}
        </span>
      </div>

      {showExcerpt && (
        <div
          className="article-card-excerpt"
          dangerouslySetInnerHTML={{ __html: excerpt }}
        ></div>
      )}
    </div>
  );

  return (
    <article
      className={`article-card variant-${variant} image-position-${imagePosition} ${className}`}
    >
      {imagePosition === "top" && (
        <>
          {imageContent}
          {textContent}
        </>
      )}
      {imagePosition === "left" && (
        <>
          {imageContent}
          {textContent}
        </>
      )}
      {imagePosition === "right" && (
        <>
          {textContent}
          {imageContent}
        </>
      )}
    </article>
  );
};

export default ArticleCard;
