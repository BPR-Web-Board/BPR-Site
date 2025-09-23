"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { EnhancedPost } from "../../../lib/types";
import {
  stripHtml,
  truncateText,
  getArticleTitle,
  getArticleLink,
} from "../../../lib/utils";
import "./FeaturedArticle.css";

export interface FeaturedArticleProps {
  article: EnhancedPost;
  excerptLength?: number;
  imagePosition?: "top" | "left" | "right";
  variant?: "default" | "large" | "compact" | "preview-grid";
  showImage?: boolean;
  className?: string;
}

const FeaturedArticle: React.FC<FeaturedArticleProps> = ({
  article,
  excerptLength = 300,
  imagePosition = "top",
  variant = "default",
  showImage = true,
  className = "",
}) => {
  const articleLink = getArticleLink(article);
  const title = getArticleTitle(article);
  const excerpt = truncateText(
    stripHtml(article?.excerpt?.rendered || ""),
    excerptLength
  );

  const imageContent = showImage && (
    <div className="featured-article-image-container">
      {article?.featured_media_obj?.source_url ? (
        <Image
          src={article.featured_media_obj.source_url}
          alt={stripHtml(title)}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="featured-article-image"
          priority
        />
      ) : (
        <div className="featured-article-image-placeholder">
          <span>Image not available</span>
        </div>
      )}
    </div>
  );

  const textContent = (
    <div className="featured-article-content">
      <Link href={articleLink} className="featured-article-title-link">
        <h3
          className="featured-article-title"
          dangerouslySetInnerHTML={{ __html: title }}
        />
      </Link>

      {variant === "preview-grid" ? (
        <>
          <div className="featured-article-meta">
            <span className="featured-article-author">
              {(article?.author_name || "LASTNAME").toUpperCase()}
            </span>
          </div>
          <div
            className="featured-article-excerpt"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
        </>
      ) : (
        <>
          <div className="featured-article-meta">
            <span className="featured-article-author">
              BY {(article?.author_name || "LASTNAME").toUpperCase()}
            </span>
          </div>

          <div
            className="featured-article-excerpt"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
        </>
      )}
    </div>
  );

  return (
    <article
      className={`featured-article variant-${variant} image-${imagePosition} ${className}`}
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

export default FeaturedArticle;
